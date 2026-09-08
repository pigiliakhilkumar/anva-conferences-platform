import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { conference: { findFirst: vi.fn() } },
}));
import {
  canTransition,
  PUBLIC_STATUSES,
  publicConferenceWhere,
} from "@/lib/conferences";

describe("public conference visibility", () => {
  it("permits only explicitly public lifecycle statuses", () => {
    expect(PUBLIC_STATUSES).toEqual(["PUBLISHED", "ONGOING", "COMPLETED"]);
    expect(PUBLIC_STATUSES).not.toContain("DRAFT");
    expect(PUBLIC_STATUSES).not.toContain("ARCHIVED");
    expect(PUBLIC_STATUSES).not.toContain("CANCELLED");
  });

  it("requires a publication timestamp as well as a public status", () => {
    expect(publicConferenceWhere()).toEqual({
      status: { in: ["PUBLISHED", "ONGOING", "COMPLETED"] },
      publishedAt: { not: null },
    });
  });
});

describe("conference lifecycle transitions", () => {
  it.each([
    ["DRAFT", "PUBLISHED"],
    ["PUBLISHED", "DRAFT"],
    ["PUBLISHED", "ONGOING"],
    ["ONGOING", "COMPLETED"],
    ["COMPLETED", "ARCHIVED"],
    ["ARCHIVED", "DRAFT"],
    ["CANCELLED", "DRAFT"],
  ] as const)("allows %s to become %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    ["DRAFT", "ONGOING"],
    ["DRAFT", "COMPLETED"],
    ["ONGOING", "DRAFT"],
    ["COMPLETED", "PUBLISHED"],
    ["ARCHIVED", "PUBLISHED"],
    ["CANCELLED", "PUBLISHED"],
  ] as const)("rejects unsafe %s to %s shortcuts", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it.each([
    "DRAFT",
    "PUBLISHED",
    "ONGOING",
    "COMPLETED",
    "ARCHIVED",
    "CANCELLED",
  ] as const)("treats a repeated %s transition as idempotent", (status) => {
    expect(canTransition(status, status)).toBe(true);
  });
});
