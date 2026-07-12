export function sanitizeText(input: string): string {
  if (typeof input !== "string") return input as unknown as string;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export function sanitizeNullable(input: string | null | undefined): string | null | undefined {
  if (input == null) return input;
  return sanitizeText(input);
}

export function sanitizeArray(items?: string[]): string[] | undefined {
  if (!items || !Array.isArray(items)) return items;
  return items.map(sanitizeText).filter(Boolean);
}
