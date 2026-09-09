"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireConferenceManager } from "@/lib/auth";
import { audit } from "@/lib/audit";
import type { ActionState } from "@/lib/validation";

const sessionSchema = z.object({ conferenceId: z.string().min(1), title: z.string().trim().min(2).max(200), dayId: z.string().min(1), startsAt: z.coerce.date(), endsAt: z.coerce.date(), type: z.enum(["KEYNOTE","PLENARY","ORAL","POSTER","WORKSHOP","PANEL","CEREMONY","NETWORKING","OTHER"]), roomId: z.string().optional(), trackId: z.string().optional(), visibility: z.enum(["DRAFT","PUBLISHED","PRIVATE"]).default("DRAFT") });
export async function createProgrammeSessionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const input = sessionSchema.safeParse(Object.fromEntries(formData)); if (!input.success || input.data.endsAt <= input.data.startsAt) return { ok: false, message: "Provide valid session times." }; const d = input.data; const manager = await requireConferenceManager(d.conferenceId);
  const day = await db.programmeDay.findFirst({ where: { id: d.dayId, conferenceId: d.conferenceId } }); if (!day) return { ok: false, message: "Programme day not found." };
  if (d.roomId) { const conflict = await db.programmeSession.findFirst({ where: { conferenceId: d.conferenceId, roomId: d.roomId, startsAt: { lt: d.endsAt }, endsAt: { gt: d.startsAt } } }); if (conflict) return { ok: false, message: "That room is already booked for this time." }; }
  const session = await db.programmeSession.create({ data: { conferenceId: d.conferenceId, dayId: d.dayId, roomId: d.roomId || undefined, trackId: d.trackId || undefined, title: d.title, type: d.type, startsAt: d.startsAt, endsAt: d.endsAt, visibility: d.visibility } });
  await audit("PROGRAMME_SESSION_CREATED", manager.id, "ProgrammeSession", session.id); revalidatePath(`/conferences/${d.conferenceId}`); return { ok: true, message: "Programme session created." };
}

export async function scheduleSubmissionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const conferenceId = String(formData.get("conferenceId") || ""); const submissionId = String(formData.get("submissionId") || ""); const sessionId = String(formData.get("sessionId") || ""); const manager = await requireConferenceManager(conferenceId);
  const submission = await db.submission.findFirst({ where: { id: submissionId, conferenceId, status: "ACCEPTED" } }); if (!submission) return { ok: false, message: "Only accepted submissions can be scheduled." };
  const session = await db.programmeSession.findFirst({ where: { id: sessionId, conferenceId } }); if (!session) return { ok: false, message: "Session not found." };
  await db.programmeAssignment.create({ data: { sessionId, submissionId, presentationTitle: String(formData.get("title") || submission.title), sequence: Number(formData.get("sequence") || 1), presenterUserId: submission.ownerId } });
  await audit("SUBMISSION_SCHEDULED", manager.id, "Submission", submissionId, { sessionId }); revalidatePath(`/workspace/manage`); return { ok: true, message: "Submission scheduled." };
}
export async function assignSessionPeopleAction(_: ActionState, fd: FormData): Promise<ActionState> { const c=String(fd.get("conferenceId")||""); const u=await requireConferenceManager(c); const id=String(fd.get("sessionId")||""); const s=await db.programmeSession.findFirst({where:{id,conferenceId:c}}); if(!s)return{ok:false,message:"Session not found."}; await db.programmeSession.update({where:{id},data:{chairName:String(fd.get("chairName")||"").slice(0,160)||null,moderatorName:String(fd.get("moderatorName")||"").slice(0,160)||null}}); await audit("SESSION_PEOPLE_ASSIGNED",u.id,"ProgrammeSession",id); return{ok:true,message:"Session people updated."}; }
