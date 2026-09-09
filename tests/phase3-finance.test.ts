import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import { applyDiscount, calculateTax, registrationTotal } from "@/lib/finance";

describe("Phase 3 financial foundations", () => {
  it("applies percentage discounts without negative totals", () => {
    expect(applyDiscount("100.00", { type: "PERCENTAGE", value: new Decimal(15) }).toFixed(2)).toBe("15.00");
    expect(registrationTotal("100", "200", "0", null).total.toFixed(2)).toBe("0.00");
  });
  it("calculates inclusive and exclusive tax with decimal precision", () => {
    expect(calculateTax("100", { rate: new Decimal(18), inclusive: false }).total.toFixed(2)).toBe("118.00");
    expect(calculateTax("118", { rate: new Decimal(18), inclusive: true }).tax.toFixed(2)).toBe("18.00");
  });
});
