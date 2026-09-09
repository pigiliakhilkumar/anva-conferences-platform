"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAccount, requireConferenceManager } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { applyDiscount, calculateTax, countryIsDomestic, decimal, money, selectRegistrationPrice } from "@/lib/finance";
import type { ActionState } from "@/lib/validation";

const registrationSchema = z.object({ conferenceId: z.string().min(1), categoryId: z.string().min(1), acceptedSubmissionId: z.string().optional(), discountCode: z.string().trim().max(64).optional(), billingName: z.string().trim().max(160).optional(), billingAddress: z.string().trim().max(500).optional(), taxId: z.string().trim().max(80).optional() });

function ref(prefix: string) { return `${prefix}-${new Date().getFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`; }

export async function createRegistrationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount();
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Select a valid conference and registration category." };
  const input = parsed.data;
  const conference = await db.conference.findUnique({ where: { id: input.conferenceId }, include: { registrationCategories: { include: { prices: true } }, discountCodes: true, taxConfigurations: { where: { active: true } } } });
  if (!conference || conference.status !== "PUBLISHED") return { ok: false, message: "This conference is not open for registration." };
  const category = conference.registrationCategories.find(c => c.id === input.categoryId && c.active);
  if (!category) return { ok: false, message: "That registration category is unavailable." };
  const now = new Date();
  if ((category.opensAt && category.opensAt > now) || (category.closesAt && category.closesAt < now)) return { ok: false, message: "Registration for this category is closed." };
  if (category.invitationOnly) return { ok: false, message: "This category is invitation-only." };
  const existing = await db.registration.findFirst({ where: { conferenceId: conference.id, userId: user.id, status: { notIn: ["CANCELLED", "REFUNDED"] } }, select: { id: true } });
  if (existing) return { ok: false, message: "You already have an active registration for this conference." };
  let acceptedSubmission = null;
  if (category.requiresAcceptedSubmission || input.acceptedSubmissionId) {
    acceptedSubmission = await db.submission.findFirst({ where: { id: input.acceptedSubmissionId || "", conferenceId: conference.id, ownerId: user.id, status: "ACCEPTED" }, select: { id: true, referenceNumber: true } });
    if (!acceptedSubmission) return { ok: false, message: "An accepted submission is required for this category." };
  }
  const domestic = countryIsDomestic(user.country, conference.country);
  const price = selectRegistrationPrice(category.prices, now, domestic);
  if (!price) return { ok: false, message: "No active price is configured for this category." };
  let discount = money(0); let discountCodeId: string | undefined;
  const codeText = input.discountCode?.toUpperCase();
  if (codeText) {
    const code = conference.discountCodes.find(c => c.code === codeText && c.active && (!c.validFrom || c.validFrom <= now) && (!c.validUntil || c.validUntil >= now) && (!c.categoryId || c.categoryId === category.id));
    if (!code) return { ok: false, message: "The discount code is invalid or expired." };
    if (code.maxUses && await db.discountRedemption.count({ where: { discountCodeId: code.id } }) >= code.maxUses) return { ok: false, message: "The discount code has reached its usage limit." };
    const used = await db.discountRedemption.count({ where: { discountCodeId: code.id, participantId: user.id } });
    if (code.maxUsesPerParticipant && used >= code.maxUsesPerParticipant) return { ok: false, message: "You have already used this discount code." };
    discount = applyDiscount(price.amount, code); discountCodeId = code.id;
  }
  const tax = calculateTax(decimal(price.amount).sub(discount), conference.taxConfigurations[0] || null);
  const total = money(tax.total);
  const status = total.eq(0) ? "COMPLIMENTARY" : "PENDING_PAYMENT";
  const registration = await db.registration.create({ data: { referenceNumber: ref("ANVA-REG"), conferenceId: conference.id, userId: user.id, categoryId: category.id, acceptedSubmissionId: acceptedSubmission?.id, presenter: Boolean(acceptedSubmission), status, paymentStatus: total.eq(0) ? "NOT_REQUIRED" : "PENDING", countryAtRegistration: user.country, priceAmount: price.amount, priceCurrency: price.currency, priceTier: price.tier, discountAmount: discount, taxAmount: tax.tax, totalAmount: total, billingName: input.billingName || user.name, billingAddress: input.billingAddress, billingTaxId: input.taxId, submittedAt: now, statusHistory: { create: { toStatus: status, note: "Registration created", changedById: user.id } }, ...(discountCodeId ? { discountRedemptions: { create: { discountCodeId, participantId: user.id, amount: discount } } } : {}) } });
  await audit("REGISTRATION_CREATED", user.id, "Registration", registration.id, { reference: registration.referenceNumber });
  await notify(user.id, "REGISTRATION_CREATED", "Registration received", `Your registration ${registration.referenceNumber} was created.`);
  revalidatePath("/workspace");
  return { ok: true, message: status === "COMPLIMENTARY" ? "Registration confirmed." : "Registration created. Payment is pending." };
}

export async function submitManualPaymentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount(); const registrationId = String(formData.get("registrationId") || ""); const reference = String(formData.get("reference") || "").trim();
  if (!registrationId || !reference) return { ok: false, message: "Enter the payment reference." };
  const registration = await db.registration.findFirst({ where: { id: registrationId, userId: user.id }, select: { id: true, totalAmount: true, conferenceId: true, referenceNumber: true } });
  if (!registration) return { ok: false, message: "Registration not found." };
  await db.manualPaymentSubmission.create({ data: { registrationId, reference, paymentDate: new Date(), notes: String(formData.get("notes") || "").slice(0, 500), status: "SUBMITTED" } });
  await db.registration.update({ where: { id: registrationId }, data: { status: "PAYMENT_PENDING_VERIFICATION", paymentStatus: "PENDING" } });
  await audit("MANUAL_PAYMENT_SUBMITTED", user.id, "Registration", registrationId); await notify(user.id, "MANUAL_PAYMENT_SUBMITTED", "Payment submitted", "Your payment is awaiting verification.");
  revalidatePath("/workspace"); return { ok: true, message: "Payment submitted for verification." };
}

export async function verifyManualPaymentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const manager = await requireConferenceManager(String(formData.get("conferenceId") || "")); const id = String(formData.get("paymentId") || ""); const approved = formData.get("approved") === "true";
  const payment = await db.manualPaymentSubmission.findUnique({ where: { id }, include: { registration: true } });
  if (!payment) return { ok: false, message: "Payment submission not found." };
  if (payment.registration.conferenceId !== String(formData.get("conferenceId") || "")) return { ok: false, message: "Not authorized." };
  const status = approved ? "VERIFIED" : "REJECTED";
  await db.manualPaymentSubmission.update({ where: { id }, data: { status, reviewedById: manager.id, reviewedAt: new Date(), reviewNotes: String(formData.get("notes") || "").slice(0, 500) } });
  if (approved) { await db.payment.create({ data: { registrationId: payment.registrationId, userId: payment.registration.userId, conferenceId: payment.registration.conferenceId, amount: payment.registration.totalAmount, currency: payment.registration.priceCurrency, provider: "manual", internalReference: ref("ANVA-PAY"), status: "PAID", verificationState: "VERIFIED", completedAt: new Date() } }); await db.registration.update({ where: { id: payment.registrationId }, data: { status: "CONFIRMED", paymentStatus: "PAID", confirmedAt: new Date() } }); }
  await audit(approved ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED", manager.id, "ManualPaymentSubmission", id); revalidatePath("/workspace/manage"); return { ok: true, message: approved ? "Payment verified." : "Payment rejected." };
}
