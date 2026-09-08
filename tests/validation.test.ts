import { describe, expect, it } from "vitest";
import {
  conferenceSchema,
  importantDateSchema,
  loginSchema,
  subscriberSchema,
} from "@/lib/validation";

const validConference = {
  title: "International Conference on Responsible Research",
  acronym: "ICRR",
  slug: "icrr-2027",
  shortDescription:
    "A sufficiently detailed conference summary used only inside this isolated validation test.",
  about: "",
  theme: "",
  scope: "INTERNATIONAL" as const,
  eventType: "CONFERENCE" as const,
  deliveryMode: "PHYSICAL" as const,
  startDate: "2027-08-12T09:00:00.000Z",
  endDate: "2027-08-14T17:00:00.000Z",
  timezone: "Asia/Kolkata",
  venueName: "",
  city: "Kolkata",
  region: "West Bengal",
  country: "India",
  venueDescription: "",
  mapUrl: "",
  virtualInfo: "",
  travelInfo: "",
  accommodationInfo: "",
  callForPapers: "",
  submissionGuidelines: "",
  registrationInfo: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  contactText: "",
  seoTitle: "",
  metaDescription: "",
};

describe("conference creation validation", () => {
  it("accepts a complete physical conference and normalizes its slug", () => {
    const result = conferenceSchema.parse({
      ...validConference,
      slug: "  ICRR 2027: Research & Practice  ",
    });

    expect(result.slug).toBe("icrr-2027-research-practice");
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it.each(["INTERNATIONAL", "NATIONAL"] as const)(
    "accepts the %s geographic classification",
    (scope) => {
      expect(conferenceSchema.safeParse({ ...validConference, scope }).success).toBe(true);
    },
  );

  it("rejects a conference whose end precedes its start", () => {
    const result = conferenceSchema.safeParse({
      ...validConference,
      startDate: "2027-08-14T09:00:00.000Z",
      endDate: "2027-08-12T17:00:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate).toContain(
        "End date must be on or after the start date",
      );
    }
  });

  it.each(["PHYSICAL", "HYBRID"] as const)(
    "requires location data for %s events",
    (deliveryMode) => {
      const result = conferenceSchema.safeParse({
        ...validConference,
        deliveryMode,
        city: "",
        country: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.city).toContain(
          "Physical and hybrid events require a city and country",
        );
      }
    },
  );

  it("permits a virtual event without a physical location", () => {
    expect(
      conferenceSchema.safeParse({
        ...validConference,
        deliveryMode: "VIRTUAL",
        city: "",
        country: "",
      }).success,
    ).toBe(true);
  });

  it("rejects short production-facing descriptions", () => {
    expect(
      conferenceSchema.safeParse({ ...validConference, shortDescription: "Too short" }).success,
    ).toBe(false);
  });
});

describe("important date validation", () => {
  it("coerces standard dates into Date values", () => {
    const result = importantDateSchema.parse({
      type: "ABSTRACT_DEADLINE",
      date: "2027-05-01T23:59:00.000Z",
      customLabel: "",
      notes: "",
    });

    expect(result.date).toBeInstanceOf(Date);
  });

  it("requires a truthful label for a custom deadline", () => {
    const result = importantDateSchema.safeParse({
      type: "CUSTOM",
      date: "2027-05-01T23:59:00.000Z",
      customLabel: "",
      notes: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.customLabel).toContain(
        "Custom dates require a label",
      );
    }
  });
});

describe("authentication and subscription inputs", () => {
  it("normalizes subscriber addresses for reliable duplicate handling", () => {
    expect(subscriberSchema.parse({ email: "  READER@Example.COM " }).email).toBe(
      "reader@example.com",
    );
  });

  it("rejects malformed subscriber addresses", () => {
    expect(subscriberSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("normalizes administrator email and requires a non-trivial password", () => {
    expect(
      loginSchema.parse({ email: " ADMIN@Example.com ", password: "correct-horse-battery" }),
    ).toMatchObject({ email: "admin@example.com" });
    expect(
      loginSchema.safeParse({ email: "admin@example.com", password: "short" }).success,
    ).toBe(false);
  });
});
