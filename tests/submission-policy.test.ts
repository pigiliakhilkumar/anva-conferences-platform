import { describe, expect, it } from "vitest";
import { canEditSubmission, conferenceAcceptsKind, statusForDecision } from "@/lib/submission-policy";

describe("submission lifecycle policy", () => {
  it("only permits author editing for drafts and requested revisions", () => {
    expect(canEditSubmission("DRAFT")).toBe(true);
    expect(canEditSubmission("REVISION_REQUESTED")).toBe(true);
    expect(canEditSubmission("UNDER_REVIEW")).toBe(false);
    expect(canEditSubmission("ACCEPTED")).toBe(false);
  });
  it("maps editorial decisions to author-visible lifecycle states", () => {
    expect(statusForDecision("ACCEPT")).toBe("ACCEPTED");
    expect(statusForDecision("REVISION_REQUIRED")).toBe("REVISION_REQUESTED");
    expect(statusForDecision("REJECT")).toBe("REJECTED");
  });
  it("honors each conference submission-type switch", () => {
    const conference = { abstractAllowed: true, fullPaperAllowed: false, posterAllowed: true, workshopProposalAllowed: false };
    expect(conferenceAcceptsKind(conference, "ABSTRACT")).toBe(true);
    expect(conferenceAcceptsKind(conference, "FULL_PAPER")).toBe(false);
    expect(conferenceAcceptsKind(conference, "POSTER")).toBe(true);
    expect(conferenceAcceptsKind(conference, "WORKSHOP_PROPOSAL")).toBe(false);
  });
});
