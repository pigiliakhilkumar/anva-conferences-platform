"use server";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeReturnPath } from "@/lib/text";
import { loginSchema, type ActionState } from "@/lib/validation";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address and password." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.active || user.role !== "ADMINISTRATOR" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, message: "The email address or password is incorrect." };
  }
  await createSession(user.id);
  await audit("ADMIN_LOGIN", user.id, "User", user.id);
  redirect(safeReturnPath(String(formData.get("returnTo") || "")));
}

export async function logoutAction() { await destroySession(); redirect("/admin/login"); }
