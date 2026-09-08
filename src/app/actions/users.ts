"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function updateUserAccessAction(userId: string, formData: FormData) {
  const admin = await requireAdmin(); const role = String(formData.get("role") || ""); const active = formData.get("active") === "on";
  if (!["PARTICIPANT", "REVIEWER", "CONFERENCE_MANAGER", "ADMINISTRATOR"].includes(role)) throw new Error("Invalid role.");
  if (admin.id === userId && (!active || role !== "ADMINISTRATOR")) throw new Error("You cannot deactivate or demote your current administrator account.");
  const user = await db.user.update({ where: { id: userId }, data: { role: role as "PARTICIPANT" | "REVIEWER" | "CONFERENCE_MANAGER" | "ADMINISTRATOR", active } });
  if (!active) await db.session.deleteMany({ where: { userId } });
  await audit("USER_ACCESS_UPDATED", admin.id, "User", userId, { role: user.role, active: user.active }); revalidatePath("/admin/users");
}
