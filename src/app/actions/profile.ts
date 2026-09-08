"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAccount } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema, type ActionState } from "@/lib/validation";
export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> { const user = await requireAccount(); const parsed = profileSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check your profile details." }; const clean = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [key, value || null])); await db.user.update({ where: { id: user.id }, data: clean }); await audit("PARTICIPANT_PROFILE_UPDATED", user.id, "User", user.id); revalidatePath("/account"); revalidatePath("/workspace"); return { ok: true, message: "Profile saved." }; }
