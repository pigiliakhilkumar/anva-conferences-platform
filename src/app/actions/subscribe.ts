"use server";
import { db } from "@/lib/db";
import { subscriberSchema, type ActionState } from "@/lib/validation";

export async function subscribeAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = subscriberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const existing = await db.subscriber.findUnique({ where: { email: parsed.data.email } });
  if (existing?.active) return { ok: true, message: "This address is already subscribed." };
  if (existing) await db.subscriber.update({ where: { id: existing.id }, data: { active: true, unsubscribedAt: null } });
  else await db.subscriber.create({ data: { email: parsed.data.email } });
  return { ok: true, message: "Your subscription has been recorded. Email delivery is not yet configured." };
}
