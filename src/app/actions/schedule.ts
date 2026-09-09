"use server";
import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/validation";
export async function saveProgrammeAction(_: ActionState, fd: FormData): Promise<ActionState> { const u = await requireAccount(); const sessionId = String(fd.get("sessionId") || ""); const s = await db.programmeSession.findFirst({ where: { id: sessionId, visibility: "PUBLISHED" } }); if (!s) return { ok: false, message: "Session is not publicly available." }; await db.savedProgrammeItem.upsert({ where: { userId_sessionId: { userId: u.id, sessionId } }, update: {}, create: { userId: u.id, sessionId } }); revalidatePath("/workspace/schedule"); return { ok: true, message: "Saved to My Schedule." }; }
export async function removeProgrammeAction(_: ActionState, fd: FormData): Promise<ActionState> { const u = await requireAccount(); await db.savedProgrammeItem.deleteMany({ where: { userId: u.id, sessionId: String(fd.get("sessionId") || "") } }); revalidatePath("/workspace/schedule"); return { ok: true, message: "Removed from My Schedule." }; }
