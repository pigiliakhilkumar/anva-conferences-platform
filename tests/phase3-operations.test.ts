import { describe, expect, it } from "vitest";
import { sanitizeSpreadsheetCell, toCsv } from "@/lib/csv";
describe("Phase 3 operational safeguards", () => {
  it("neutralizes spreadsheet formulas", () => { expect(sanitizeSpreadsheetCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)"); expect(toCsv([["+danger", "safe"]])).toContain("'+danger"); });
  it("preserves ordinary values", () => { expect(sanitizeSpreadsheetCell("ANVA")).toBe("ANVA"); });
});
