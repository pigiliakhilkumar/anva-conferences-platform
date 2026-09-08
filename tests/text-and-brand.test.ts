import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  APP_TAGLINE,
  APP_URL,
  CONTACT_EMAIL,
  DEFAULT_CATEGORIES,
  EDITORIAL_EMAIL,
  ORGANIZATION_LINE,
  SECTION_DEFAULTS,
} from "@/lib/constants";
import { formatDate, safeReturnPath, slugify, toPlainText } from "@/lib/text";

describe("text safety helpers", () => {
  it.each([
    ["  Materials & Energy 2027  ", "materials-energy-2027"],
    ["Santé & Sciences", "sante-sciences"],
    ["---Conference---", "conference"],
  ])("slugifies %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("limits generated slugs to the database validation limit", () => {
    expect(slugify("a".repeat(140))).toHaveLength(100);
  });

  it.each(["https://attacker.example", "//attacker.example/path", "\\\\server\\share"])(
    "blocks unsafe return path %s",
    (input) => {
      expect(safeReturnPath(input)).toBe("/admin");
    },
  );

  it("allows an internal return path and supports a custom fallback", () => {
    expect(safeReturnPath("/admin/conferences?status=draft")).toBe(
      "/admin/conferences?status=draft",
    );
    expect(safeReturnPath(null, "/admin/login")).toBe("/admin/login");
  });

  it("converts optional copy to trimmed plain text", () => {
    expect(toPlainText("  Programme forthcoming  ")).toBe("Programme forthcoming");
    expect(toPlainText(undefined)).toBe("");
  });

  it("formats dates in stable UTC rather than the host timezone", () => {
    expect(formatDate("2027-01-02T23:30:00-08:00")).toBe("Jan 3, 2027");
  });
});

describe("public brand contracts", () => {
  it("uses the approved identity and contacts exactly", () => {
    expect(APP_NAME).toBe("ANVA Conferences");
    expect(APP_TAGLINE).toBe("Academic & Scientific Conferences");
    expect(ORGANIZATION_LINE).toBe("A scholarly events initiative of ANVA Publishing");
    expect(APP_URL).toBe("https://conferences.anvapublishing.com");
    expect(CONTACT_EMAIL).toBe("contact@anvapublishing.com");
    expect(EDITORIAL_EMAIL).toBe("editorial@anvapublishing.com");
  });

  it("provides every configurable microsite section once", () => {
    const keys = SECTION_DEFAULTS.map(([key]) => key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "about",
        "important-dates",
        "tracks",
        "speakers",
        "committees",
        "programme",
        "downloads",
        "faq",
        "contact",
      ]),
    );
  });

  it("includes the required multidisciplinary category foundation", () => {
    expect(DEFAULT_CATEGORIES).toContain("Medical & Health Sciences");
    expect(DEFAULT_CATEGORIES).toContain("Artificial Intelligence & Computing");
    expect(DEFAULT_CATEGORIES).toContain("Interdisciplinary Research");
    expect(new Set(DEFAULT_CATEGORIES).size).toBe(DEFAULT_CATEGORIES.length);
  });
});
