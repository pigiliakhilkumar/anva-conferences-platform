import Decimal from "decimal.js";
import type { RegistrationPrice, TaxConfiguration, DiscountCode } from "@prisma/client";

export function decimal(value: Decimal.Value | null | undefined) { return new Decimal(value || 0); }
export function money(value: Decimal.Value) { return decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP); }
export function countryIsDomestic(country: string | null | undefined, conferenceCountry: string | null | undefined) { return Boolean(country && conferenceCountry && country.trim().toLowerCase() === conferenceCountry.trim().toLowerCase()); }
export function selectRegistrationPrice(prices: RegistrationPrice[], now: Date, domestic: boolean) {
  const valid = prices.filter(price => price.active && (!price.startsAt || price.startsAt <= now) && (!price.endsAt || price.endsAt >= now));
  const scoped = valid.filter(price => price.domestic === domestic);
  const global = valid.filter(price => price.domestic === null);
  return [...scoped, ...global].sort((a, b) => (b.startsAt?.getTime() || 0) - (a.startsAt?.getTime() || 0))[0] || null;
}
export function applyDiscount(amount: Decimal.Value, code: Pick<DiscountCode, "type" | "value"> | null) {
  const base = money(amount); if (!code) return money(0); const discount = code.type === "PERCENTAGE" ? base.mul(code.value).div(100) : decimal(code.value); return Decimal.min(base, money(discount));
}
export function calculateTax(base: Decimal.Value, config: Pick<TaxConfiguration, "rate" | "inclusive"> | null) {
  if (!config) return { tax: money(0), total: money(base) }; const value = money(base); if (config.inclusive) return { tax: money(value.mul(config.rate).div(decimal(100).add(config.rate))), total: value }; const tax = money(value.mul(config.rate).div(100)); return { tax, total: money(value.add(tax)) };
}
export function registrationTotal(price: Decimal.Value, discount: Decimal.Value, waiver: Decimal.Value, taxConfig: Pick<TaxConfiguration, "rate" | "inclusive"> | null) { const subtotal = money(price); const taxable = Decimal.max(0, subtotal.sub(discount).sub(waiver)); const taxed = calculateTax(taxable, taxConfig); return { subtotal, discount: money(discount), waiver: money(waiver), tax: taxed.tax, total: money(taxed.total) }; }
