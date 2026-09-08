import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    subscriber: mocks,
  },
}));

import { subscribeAction } from "@/app/actions/subscribe";

function data(email: string) {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("newsletter subscription action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed addresses without touching the database", async () => {
    const result = await subscribeAction(
      { ok: false, message: "" },
      data("not-an-address"),
    );

    expect(result).toEqual({ ok: false, message: "Enter a valid email address." });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("normalizes and records a new address without claiming mail was sent", async () => {
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ id: "subscriber-test-id" });

    const result = await subscribeAction(
      { ok: false, message: "" },
      data("  READER@Example.com "),
    );

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "reader@example.com" },
    });
    expect(mocks.create).toHaveBeenCalledWith({ data: { email: "reader@example.com" } });
    expect(result.ok).toBe(true);
    expect(result.message).toContain("recorded");
    expect(result.message).toContain("not yet configured");
    expect(result.message).not.toMatch(/sent|delivered/i);
  });

  it("treats an active duplicate as a truthful idempotent success", async () => {
    mocks.findUnique.mockResolvedValue({ id: "existing-test-id", active: true });

    const result = await subscribeAction(
      { ok: false, message: "" },
      data("reader@example.com"),
    );

    expect(result).toEqual({ ok: true, message: "This address is already subscribed." });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("reactivates an unsubscribed address instead of creating a duplicate", async () => {
    mocks.findUnique.mockResolvedValue({ id: "existing-test-id", active: false });

    const result = await subscribeAction(
      { ok: false, message: "" },
      data("reader@example.com"),
    );

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "existing-test-id" },
      data: { active: true, unsubscribedAt: null },
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });
});
