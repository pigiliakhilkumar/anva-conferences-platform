import type { SubmissionKind, SubmissionStatus } from "@prisma/client";

export function conferenceAcceptsKind(conference: { abstractAllowed: boolean; fullPaperAllowed: boolean; posterAllowed: boolean; workshopProposalAllowed: boolean; submissionTypes?: string | null }, kind: SubmissionKind) {
  return kind === "ABSTRACT" ? conference.abstractAllowed : kind === "FULL_PAPER" ? conference.fullPaperAllowed : kind === "POSTER" ? conference.posterAllowed : kind === "WORKSHOP_PROPOSAL" ? conference.workshopProposalAllowed : Boolean(conference.submissionTypes?.trim());
}
export function canEditSubmission(status: SubmissionStatus) { return status === "DRAFT" || status === "REVISION_REQUESTED" || status === "RETURNED_FOR_CORRECTION"; }
export function statusForDecision(type: "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REVISION_REQUIRED" | "REJECT"): SubmissionStatus { return type === "ACCEPT" ? "ACCEPTED" : type === "REJECT" ? "REJECTED" : "REVISION_REQUESTED"; }
const transitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"], SUBMITTED: ["TECHNICAL_CHECK", "UNDER_REVIEW", "WITHDRAWN"], TECHNICAL_CHECK: ["UNDER_REVIEW", "RETURNED_FOR_CORRECTION", "WITHDRAWN"], RETURNED_FOR_CORRECTION: ["SUBMITTED", "WITHDRAWN"], UNDER_REVIEW: ["REVISION_REQUESTED", "ACCEPTED", "REJECTED", "WITHDRAWN"], REVISION_REQUESTED: ["REVISED", "WITHDRAWN"], REVISED: ["TECHNICAL_CHECK", "UNDER_REVIEW", "WITHDRAWN"], ACCEPTED: [], REJECTED: [], WITHDRAWN: [],
};
export function canTransition(from: SubmissionStatus, to: SubmissionStatus) { return from === to || transitions[from].includes(to); }
