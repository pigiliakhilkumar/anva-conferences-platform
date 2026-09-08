"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeReturnPath } from "@/lib/text";
import { loginSchema, registrationSchema, type ActionState } from "@/lib/validation";

export async function accountLoginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address and password." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) return { ok: false, message: "The email address or password is incorrect." };
  await createSession(user.id); await audit("ACCOUNT_LOGIN", user.id, "User", user.id);
  redirect(safeReturnPath(String(formData.get("returnTo") || "/workspace"), "/workspace"));
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check your account details.", errors: parsed.error.flatten().fieldErrors };
  if (await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })) return { ok: false, message: "An account already exists for this email address." };
  const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 12), role: "PARTICIPANT" } });
  await createSession(user.id); await audit("PARTICIPANT_REGISTERED", user.id, "User", user.id); redirect("/workspace");
}
export async function accountLogoutAction() { await destroySession(); redirect("/login"); }
