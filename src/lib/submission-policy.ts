import type { SubmissionKind, SubmissionStatus } from "@prisma/client";

export function conferenceAcceptsKind(conference: { abstractAllowed: boolean; fullPaperAllowed: boolean; posterAllowed: boolean; workshopProposalAllowed: boolean }, kind: SubmissionKind) {
  return kind === "ABSTRACT" ? conference.abstractAllowed : kind === "FULL_PAPER" ? conference.fullPaperAllowed : kind === "POSTER" ? conference.posterAllowed : conference.workshopProposalAllowed;
}
export function canEditSubmission(status: SubmissionStatus) { return status === "DRAFT" || status === "REVISION_REQUESTED"; }
export function statusForDecision(type: "ACCEPT" | "REVISION_REQUIRED" | "REJECT"): SubmissionStatus { return type === "ACCEPT" ? "ACCEPTED" : type === "REJECT" ? "REJECTED" : "REVISION_REQUESTED"; }
