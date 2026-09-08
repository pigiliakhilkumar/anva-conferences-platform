"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { requireAccount, requireManager, requireReviewer } from "@/lib/auth";
import { db } from "@/lib/db";
import { createObjectKey, MediaValidationError, persistUpload, removeStoredMedia, validateUpload } from "@/lib/media";
import { canEditSubmission, conferenceAcceptsKind, statusForDecision } from "@/lib/submission-policy";
import { notify } from "@/lib/notifications";
import { createHash } from "node:crypto";
import { authorSchema, decisionSchema, reviewSchema, submissionSchema, type ActionState } from "@/lib/validation";

const values = (formData: FormData) => Object.fromEntries(formData);
export async function createSubmissionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount(); const parsed = submissionSchema.safeParse(values(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the submission details.", errors: parsed.error.flatten().fieldErrors };
  const conference = await db.conference.findUnique({ where: { id: parsed.data.conferenceId }, include: { tracks: { select: { id: true } } } });
  if (!conference || !["PUBLISHED", "ONGOING"].includes(conference.status) || conference.submissionState !== "OPEN") return { ok: false, message: "This conference is not accepting submissions." };
  if (!conferenceAcceptsKind(conference, parsed.data.kind)) return { ok: false, message: "That submission type is not enabled for this conference." };
  if (parsed.data.trackId && !conference.tracks.some(t => t.id === parsed.data.trackId)) return { ok: false, message: "Select a track from this conference." };
  const submission = await db.$transaction(async tx => {
    const sequence = await tx.submissionSequence.upsert({ where: { conferenceId: conference.id }, create: { conferenceId: conference.id, nextValue: 2 }, update: { nextValue: { increment: 1 } } });
    const prefix = (conference.acronym || conference.title).replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase() || "CONF";
    const referenceNumber = `${prefix}-${conference.startDate.getUTCFullYear()}-${String(sequence.nextValue - 1).padStart(4, "0")}`;
    return tx.submission.create({ data: { referenceNumber, title: parsed.data.title, abstractText: parsed.data.abstractText, keywords: parsed.data.keywords || null, kind: parsed.data.kind, trackId: parsed.data.trackId || null, ownerId: user.id, conferenceId: conference.id, history: { create: { toStatus: "DRAFT", changedById: user.id } }, authors: { create: { name: user.name || user.email, email: user.email, corresponding: true } } } });
  });
  await audit("SUBMISSION_CREATED", user.id, "Submission", submission.id); redirect(`/workspace/submissions/${submission.id}`);
}

export async function updateSubmissionAction(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount(); const existing = await db.submission.findFirst({ where: { id, ownerId: user.id }, include: { conference: { include: { tracks: { select: { id: true } } } } } });
  if (!existing || !canEditSubmission(existing.status)) return { ok: false, message: "This submission cannot be edited." };
  const parsed = submissionSchema.safeParse({ ...values(formData), conferenceId: existing.conferenceId });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the submission details.", errors: parsed.error.flatten().fieldErrors };
  if (!conferenceAcceptsKind(existing.conference, parsed.data.kind) || (parsed.data.trackId && !existing.conference.tracks.some(t => t.id === parsed.data.trackId))) return { ok: false, message: "The type or track is not available for this conference." };
  await db.submission.update({ where: { id }, data: { title: parsed.data.title, abstractText: parsed.data.abstractText, keywords: parsed.data.keywords || null, kind: parsed.data.kind, trackId: parsed.data.trackId || null } });
  await audit("SUBMISSION_UPDATED", user.id, "Submission", id); revalidatePath(`/workspace/submissions/${id}`); return { ok: true, message: "Draft saved." };
}

export async function addAuthorAction(submissionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount(); const submission = await db.submission.findFirst({ where: { id: submissionId, ownerId: user.id } });
  if (!submission || !canEditSubmission(submission.status)) return { ok: false, message: "Authors cannot be changed now." };
  const parsed = authorSchema.safeParse(values(formData)); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the author details." };
  const count = await db.submissionAuthor.count({ where: { submissionId } });
  await db.$transaction(async tx => { if (parsed.data.corresponding) await tx.submissionAuthor.updateMany({ where: { submissionId }, data: { corresponding: false } }); await tx.submissionAuthor.create({ data: { submissionId, ...parsed.data, affiliation: parsed.data.affiliation || null, country: parsed.data.country || null, orcid: parsed.data.orcid || null, givenName: parsed.data.givenName || null, familyName: parsed.data.familyName || null, sortOrder: count } }); });
  await audit("SUBMISSION_AUTHOR_ADDED", user.id, "Submission", submissionId); revalidatePath(`/workspace/submissions/${submissionId}`); return { ok: true, message: "Author added." };
}

export async function removeAuthorAction(submissionId: string, authorId: string) {
  const user = await requireAccount(); const submission = await db.submission.findFirst({ where: { id: submissionId, ownerId: user.id } });
  if (!submission || !canEditSubmission(submission.status)) throw new Error("Authors cannot be changed now.");
  const author = await db.submissionAuthor.findFirst({ where: { id: authorId, submissionId } });
  if (!author || author.corresponding) throw new Error("The corresponding author cannot be removed.");
  await db.submissionAuthor.delete({ where: { id: author.id } }); await audit("SUBMISSION_AUTHOR_REMOVED", user.id, "Submission", submissionId); revalidatePath(`/workspace/submissions/${submissionId}`);
}

export async function uploadSubmissionVersionAction(submissionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAccount(); const submission = await db.submission.findFirst({ where: { id: submissionId, ownerId: user.id } });
  if (!submission || !canEditSubmission(submission.status)) return { ok: false, message: "A file cannot be added now." };
  const file = formData.get("file"); if (!(file instanceof File)) return { ok: false, message: "Choose a PDF file." };
  const response = String(formData.get("responseToReviewers") || "").trim(); if (response.length > 10000) return { ok: false, message: "The response is too long." };
  let objectKey: string | undefined;
  try {
    const upload = await validateUpload(file); if (upload.kind !== "DOCUMENT" || upload.mimeType !== "application/pdf") return { ok: false, message: "Submission files must be PDF documents." };
    objectKey = createObjectKey(upload.kind, upload.extension); await persistUpload(upload, objectKey); const integrityHash = createHash("sha256").update(upload.bytes).digest("hex");
    const latest = await db.submissionVersion.findFirst({ where: { submissionId }, orderBy: { versionNumber: "desc" } });
    await db.$transaction(async tx => { const media = await tx.mediaAsset.create({ data: { kind: "DOCUMENT", objectKey: objectKey!, originalName: upload.originalName, mimeType: upload.mimeType, byteSize: upload.byteSize, conferenceId: submission.conferenceId } }); await tx.submissionVersion.create({ data: { submissionId, versionNumber: (latest?.versionNumber || 0) + 1, mediaId: media.id, integrityHash, revisionRound: submission.status === "REVISION_REQUESTED" ? (latest?.revisionRound || 0) + 1 : (latest?.revisionRound || 0), responseToReviewers: response || null } }); });
    await audit("SUBMISSION_VERSION_UPLOADED", user.id, "Submission", submissionId); revalidatePath(`/workspace/submissions/${submissionId}`); return { ok: true, message: "PDF uploaded." };
  } catch (error) { if (objectKey) await removeStoredMedia(objectKey).catch(() => undefined); return { ok: false, message: error instanceof MediaValidationError ? error.message : "The file could not be uploaded." }; }
}

export async function submitSubmissionAction(submissionId: string) {
  const user = await requireAccount(); const submission = await db.submission.findFirst({ where: { id: submissionId, ownerId: user.id }, include: { conference: true, authors: true, versions: true } });
  if (!submission || !canEditSubmission(submission.status)) throw new Error("This submission cannot be submitted.");
  if (submission.conference.submissionState !== "OPEN") throw new Error("Submissions are closed for this conference.");
  if (!submission.authors.length || !submission.authors.some(a => a.corresponding)) throw new Error("A corresponding author is required.");
  if (submission.kind !== "ABSTRACT" && !submission.versions.length) throw new Error("Upload a PDF before submitting.");
  const nextStatus = submission.status === "REVISION_REQUESTED" ? "REVISED" : "TECHNICAL_CHECK";
  await db.$transaction([db.submission.update({ where: { id: submissionId }, data: { status: nextStatus, technicalStatus: "PENDING", submittedAt: new Date() } }), db.submissionStatusHistory.create({ data: { submissionId, fromStatus: submission.status, toStatus: nextStatus, changedById: user.id } }), notify(user.id, "SUBMISSION_RECEIVED", "Submission received", `${submission.referenceNumber} has been submitted for technical screening.`)]); await audit("SUBMISSION_SUBMITTED", user.id, "Submission", submissionId); redirect("/workspace");
}
export async function withdrawSubmissionAction(submissionId: string) {
  const user = await requireAccount(); const existing = await db.submission.findFirst({ where: { id: submissionId, ownerId: user.id, status: { in: ["SUBMITTED", "TECHNICAL_CHECK", "UNDER_REVIEW", "REVISION_REQUESTED", "REVISED", "RETURNED_FOR_CORRECTION"] } }, select: { status: true } });
  if (!existing) throw new Error("This submission cannot be withdrawn."); await db.$transaction([db.submission.update({ where: { id: submissionId }, data: { status: "WITHDRAWN", withdrawnAt: new Date() } }), db.submissionStatusHistory.create({ data: { submissionId, fromStatus: existing.status, toStatus: "WITHDRAWN", changedById: user.id } })]); await audit("SUBMISSION_WITHDRAWN", user.id, "Submission", submissionId); redirect("/workspace");
}

export async function respondToAssignmentAction(assignmentId: string, accept: boolean, formData: FormData) {
  const user = await requireReviewer(); const assignment = await db.reviewAssignment.findFirst({ where: { id: assignmentId, reviewerId: user.id, status: "INVITED" } }); if (!assignment) throw new Error("Assignment not found.");
  const conflictReason = String(formData.get("conflictReason") || "").trim(); if (!accept && conflictReason.length < 5) throw new Error("Give a brief reason for declining or declaring a conflict.");
  await db.$transaction([db.reviewAssignment.update({ where: { id: assignmentId }, data: { status: accept ? "ACCEPTED" : "DECLINED", conflictReason: accept ? null : conflictReason.slice(0, 2000), respondedAt: new Date() } }), db.submission.update({ where: { id: assignment.submissionId }, data: accept ? { status: "UNDER_REVIEW" } : {} })]);
  const owner = await db.submission.findUnique({ where: { id: assignment.submissionId }, select: { ownerId: true, referenceNumber: true } }); if (owner) await notify(owner.ownerId, "REVIEWER_RESPONDED", accept ? "Reviewer accepted" : "Reviewer declined", `${owner.referenceNumber} received a reviewer response.`);
  await audit(accept ? "REVIEW_ASSIGNMENT_ACCEPTED" : "REVIEW_ASSIGNMENT_DECLINED", user.id, "ReviewAssignment", assignmentId); revalidatePath(`/workspace/reviews/${assignmentId}`);
}
export async function submitReviewAction(assignmentId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireReviewer(); const assignment = await db.reviewAssignment.findFirst({ where: { id: assignmentId, reviewerId: user.id, status: "ACCEPTED", review: null } }); if (!assignment) return { ok: false, message: "This review cannot be submitted." };
  const parsed = reviewSchema.safeParse(values(formData)); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the review." };
  await db.$transaction([db.review.create({ data: { assignmentId, ...parsed.data, confidentialComments: parsed.data.confidentialComments || null } }), db.reviewAssignment.update({ where: { id: assignmentId }, data: { status: "COMPLETED", completedAt: new Date() } })]); const owner = await db.submission.findUnique({ where: { id: assignment.submissionId }, select: { ownerId: true, referenceNumber: true } }); if (owner) await notify(owner.ownerId, "REVIEW_SUBMITTED", "Peer review submitted", `A review has been submitted for ${owner.referenceNumber}.`); await audit("REVIEW_SUBMITTED", user.id, "ReviewAssignment", assignmentId); revalidatePath(`/workspace/reviews/${assignmentId}`); return { ok: true, message: "Review submitted. It is now read-only." };
}

export async function assignReviewerAction(submissionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const manager = await requireManager(); const email = String(formData.get("email") || "").trim().toLowerCase(); const dueAt = new Date(String(formData.get("dueAt") || ""));
  const reviewer = await db.user.findUnique({ where: { email } }); if (!reviewer || reviewer.role !== "REVIEWER" || !reviewer.active) return { ok: false, message: "No active reviewer account has that email address." };
  const submission = await db.submission.findUnique({ where: { id: submissionId } }); if (!submission || !["SUBMITTED", "UNDER_REVIEW"].includes(submission.status)) return { ok: false, message: "This submission is not available for review assignment." };
  const isAuthor = reviewer.id === submission.ownerId || Boolean(await db.submissionAuthor.findFirst({ where: { submissionId, email: reviewer.email }, select: { id: true } }));
  if (isAuthor) return { ok: false, message: "An author cannot review their own submission." };
  try { await db.reviewAssignment.create({ data: { submissionId, reviewerId: reviewer.id, dueAt: Number.isNaN(dueAt.valueOf()) ? null : dueAt } }); } catch { return { ok: false, message: "This reviewer is already assigned." }; }
  await notify(reviewer.id, "REVIEWER_INVITED", "New review invitation", `You have been invited to review ${submission.referenceNumber}.`);
  await audit("REVIEWER_ASSIGNED", manager.id, "Submission", submissionId, { reviewerId: reviewer.id }); revalidatePath(`/workspace/manage/submissions/${submissionId}`); return { ok: true, message: "Reviewer assigned." };
}
export async function recordDecisionAction(submissionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const manager = await requireManager(); const parsed = decisionSchema.safeParse(values(formData)); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the decision." };
  const submission = await db.submission.findUnique({ where: { id: submissionId } }); if (!submission || !["SUBMITTED", "UNDER_REVIEW"].includes(submission.status)) return { ok: false, message: "A decision cannot be recorded in the current state." };
  const nextStatus = statusForDecision(parsed.data.type); await db.$transaction([db.submissionDecision.create({ data: { submissionId, decidedById: manager.id, revisionRound: (await db.submissionVersion.count({ where: { submissionId } })), ...parsed.data } }), db.submission.update({ where: { id: submissionId }, data: { status: nextStatus } }), db.submissionStatusHistory.create({ data: { submissionId, fromStatus: submission.status, toStatus: nextStatus, note: parsed.data.comments, changedById: manager.id } })]); await notify(submission.ownerId, parsed.data.type === "REVISION_REQUIRED" || parsed.data.type === "MINOR_REVISION" || parsed.data.type === "MAJOR_REVISION" ? "REVISION_REQUESTED" : "DECISION_ISSUED", "Editorial decision issued", `${submission.referenceNumber} has a new editorial decision.`); await audit("SUBMISSION_DECIDED", manager.id, "Submission", submissionId, { decision: parsed.data.type }); revalidatePath(`/workspace/manage/submissions/${submissionId}`); return { ok: true, message: "Decision recorded and visible to the author." };
}

export async function technicalCheckAction(submissionId: string, passed: boolean, _: ActionState, formData: FormData): Promise<ActionState> {
  const manager = await requireManager(); const notes = String(formData.get("notes") || "").trim();
  if (notes.length > 10000 || (!passed && notes.length < 5)) throw new Error(passed ? "Technical notes are too long." : "Explain what the author must correct.");
  const submission = await db.submission.findUnique({ where: { id: submissionId } });
  if (!submission || !["SUBMITTED", "TECHNICAL_CHECK", "REVISED"].includes(submission.status)) throw new Error("This submission is not awaiting technical screening.");
  const nextStatus = passed ? "UNDER_REVIEW" : "RETURNED_FOR_CORRECTION";
  await db.$transaction([db.submission.update({ where: { id: submissionId }, data: { status: nextStatus, technicalStatus: passed ? "PASSED" : "RETURNED", technicalNotes: notes || null, technicalCheckedAt: new Date(), technicalCheckedById: manager.id } }), db.submissionStatusHistory.create({ data: { submissionId, fromStatus: submission.status, toStatus: nextStatus, note: notes || null, changedById: manager.id } }), ...(passed ? [] : [notify(submission.ownerId, "TECHNICAL_CHECK_RETURNED", "Technical correction requested", `${submission.referenceNumber} was returned for correction. Review the notes in your workspace.`)])]);
  await audit(passed ? "TECHNICAL_CHECK_PASSED" : "TECHNICAL_CHECK_RETURNED", manager.id, "Submission", submissionId); revalidatePath(`/workspace/manage/submissions/${submissionId}`); revalidatePath(`/workspace/submissions/${submissionId}`); return { ok: true, message: passed ? "Technical check passed." : "Submission returned for correction." };
}

export async function classifyPresentationAction(submissionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const manager = await requireManager(); const classification = String(formData.get("classification") || ""); const notes = String(formData.get("notes") || "").trim();
  if (!["NOT_CLASSIFIED", "ORAL", "POSTER", "OTHER"].includes(classification)) return { ok: false, message: "Choose a valid presentation classification." };
  const submission = await db.submission.findUnique({ where: { id: submissionId, status: "ACCEPTED" } }); if (!submission) return { ok: false, message: "Only accepted submissions can be classified." };
  await db.submission.update({ where: { id: submissionId }, data: { presentationClassification: classification as "NOT_CLASSIFIED" | "ORAL" | "POSTER" | "OTHER", presentationNotes: notes || null } }); await audit("PRESENTATION_CLASSIFIED", manager.id, "Submission", submissionId, { classification }); revalidatePath(`/workspace/manage/submissions/${submissionId}`); return { ok: true, message: "Presentation classification saved." };
}
