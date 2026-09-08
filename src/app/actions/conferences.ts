"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ConferenceStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/conferences";
import { SECTION_DEFAULTS } from "@/lib/constants";
import { conferenceSchema, importantDateSchema, type ActionState } from "@/lib/validation";

function values(formData: FormData) { return Object.fromEntries(formData.entries()); }
function nullable(v?: string) { return v?.trim() || null; }
function conferenceData(d: ReturnType<typeof conferenceSchema.parse>) {
  return { ...d, acronym: nullable(d.acronym), about: nullable(d.about), theme: nullable(d.theme), venueName: nullable(d.venueName), city: nullable(d.city), region: nullable(d.region), country: nullable(d.country), venueDescription: nullable(d.venueDescription), mapUrl: nullable(d.mapUrl), virtualInfo: nullable(d.virtualInfo), travelInfo: nullable(d.travelInfo), accommodationInfo: nullable(d.accommodationInfo), callForPapers: nullable(d.callForPapers), submissionGuidelines: nullable(d.submissionGuidelines), submissionTypes: nullable(d.submissionTypes), registrationInfo: nullable(d.registrationInfo), contactName: nullable(d.contactName), contactRole: nullable(d.contactRole), contactEmail: nullable(d.contactEmail), contactPhone: nullable(d.contactPhone), contactText: nullable(d.contactText), seoTitle: nullable(d.seoTitle), metaDescription: nullable(d.metaDescription) };
}

export async function createConferenceAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = conferenceSchema.safeParse(values(formData));
  if (!parsed.success) return { ok: false, message: "Please correct the conference information.", errors: parsed.error.flatten().fieldErrors };
  if (await db.conference.findUnique({ where: { slug: parsed.data.slug } })) return { ok: false, message: "That conference slug is already in use." };
  const conference = await db.conference.create({ data: { ...conferenceData(parsed.data), sections: { create: SECTION_DEFAULTS.map(([key, label], sortOrder) => ({ key, label, sortOrder })) } } });
  await audit("CONFERENCE_CREATED", user.id, "Conference", conference.id);
  redirect(`/admin/conferences/${conference.id}/edit?created=1`);
}

export async function updateConferenceAction(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = conferenceSchema.safeParse(values(formData));
  if (!parsed.success) return { ok: false, message: "Please correct the conference information.", errors: parsed.error.flatten().fieldErrors };
  if (await db.conference.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } })) return { ok: false, message: "That conference slug is already in use." };
  await db.conference.update({ where: { id }, data: conferenceData(parsed.data) });
  await audit("CONFERENCE_UPDATED", user.id, "Conference", id);
  revalidatePath(`/admin/conferences/${id}/edit`); revalidatePath("/conferences");
  return { ok: true, message: "Changes saved." };
}

export async function transitionConferenceAction(id: string, status: ConferenceStatus) {
  const user = await requireAdmin();
  const conference = await db.conference.findUnique({ where: { id } });
  if (!conference) throw new Error("Conference not found");
  if (!canTransition(conference.status, status)) throw new Error("This lifecycle transition is not permitted.");
  if (status === "PUBLISHED" && conference.deliveryMode !== "VIRTUAL" && (!conference.city || !conference.country)) throw new Error("Physical and hybrid conferences require a city and country.");
  await db.conference.update({ where: { id }, data: { status, publishedAt: status === "PUBLISHED" ? new Date() : status === "DRAFT" ? null : conference.publishedAt } });
  await audit(`CONFERENCE_${status}`, user.id, "Conference", id);
  revalidatePath("/admin/conferences"); revalidatePath(`/conferences/${conference.slug}`); revalidatePath("/conferences");
}

export async function toggleSectionAction(conferenceId: string, sectionId: string, enabled: boolean, showWhenEmpty: boolean) {
  await requireAdmin();
  if (!await db.conferenceSection.findFirst({ where: { id: sectionId, conferenceId } })) throw new Error("Section not found");
  await db.conferenceSection.update({ where: { id: sectionId }, data: { enabled, showWhenEmpty } });
  revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}

export async function addImportantDateAction(conferenceId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin(); const parsed = importantDateSchema.safeParse(values(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Invalid date" };
  await db.importantDate.create({ data: { conferenceId, ...parsed.data, customLabel: nullable(parsed.data.customLabel), notes: nullable(parsed.data.notes) } });
  revalidatePath(`/admin/conferences/${conferenceId}/edit`); return { ok: true, message: "Important date added." };
}

export async function addTrackAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const title = String(formData.get("title") || "").trim(); if (!title) return;
  await db.conferenceTrack.create({ data: { conferenceId, title: title.slice(0, 200), description: nullable(String(formData.get("description") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addSpeakerAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const name = String(formData.get("name") || "").trim(); if (!name) return;
  await db.speaker.create({ data: { conferenceId, name: name.slice(0, 180), type: String(formData.get("type")) as "KEYNOTE", designation: nullable(String(formData.get("designation") || "")), affiliation: nullable(String(formData.get("affiliation") || "")), country: nullable(String(formData.get("country") || "")), biography: nullable(String(formData.get("biography") || "")), talkTitle: nullable(String(formData.get("talkTitle") || "")), profileUrl: nullable(String(formData.get("profileUrl") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addCommitteeAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const name = String(formData.get("name") || "").trim(); if (!name) return;
  await db.committee.create({ data: { conferenceId, name: name.slice(0, 180), description: nullable(String(formData.get("description") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addCommitteeMemberAction(conferenceId: string, committeeId: string, formData: FormData) {
  await requireAdmin(); if (!await db.committee.findFirst({ where: { id: committeeId, conferenceId } })) throw new Error("Committee not found");
  const name = String(formData.get("name") || "").trim(); if (!name) return;
  await db.committeeMember.create({ data: { committeeId, name: name.slice(0, 180), role: nullable(String(formData.get("role") || "")), affiliation: nullable(String(formData.get("affiliation") || "")), country: nullable(String(formData.get("country") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addFeeAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const amount = Number(formData.get("amount")); if (!Number.isFinite(amount) || amount < 0) return;
  await db.registrationFee.create({ data: { conferenceId, category: String(formData.get("category") || "General").slice(0, 120), audience: nullable(String(formData.get("audience") || "")), priceTier: String(formData.get("priceTier") || "Regular").slice(0, 80), currency: String(formData.get("currency") || "USD").toUpperCase().slice(0, 3), amount, notes: nullable(String(formData.get("notes") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addProgrammeItemAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const title = String(formData.get("title") || "").trim(); const day = new Date(String(formData.get("day") || "")); if (!title || Number.isNaN(day.valueOf())) return;
  await db.conferenceProgrammeItem.create({ data: { conferenceId, title: title.slice(0, 200), day, room: nullable(String(formData.get("room") || "")), description: nullable(String(formData.get("description") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addSponsorAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const name = String(formData.get("name") || "").trim(); if (!name) return;
  await db.sponsor.create({ data: { conferenceId, name: name.slice(0, 180), tier: nullable(String(formData.get("tier") || "")), url: nullable(String(formData.get("url") || "")) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addFaqAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const question = String(formData.get("question") || "").trim(), answer = String(formData.get("answer") || "").trim(); if (!question || !answer) return;
  await db.conferenceFaq.create({ data: { conferenceId, question: question.slice(0, 300), answer: answer.slice(0, 5000) } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
export async function addAnnouncementAction(conferenceId: string, formData: FormData) {
  await requireAdmin(); const title = String(formData.get("title") || "").trim(), body = String(formData.get("body") || "").trim(); if (!title || !body) return;
  await db.conferenceAnnouncement.create({ data: { conferenceId, title: title.slice(0, 250), body: body.slice(0, 10000), publishedAt: formData.get("publish") ? new Date() : null } }); revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
