export function sanitizeSpreadsheetCell(value: unknown): string { const text = String(value ?? ""); return /^[=+\-@]/.test(text) ? `'${text}` : text; }
export function toCsv(rows: unknown[][]): string { return rows.map(row => row.map(value => `"${sanitizeSpreadsheetCell(value).replaceAll('"', '""')}"`).join(",")).join("\n"); }
