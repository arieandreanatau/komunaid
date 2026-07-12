export function getInitial(value: string | undefined | null, fallback = ""): string {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed[0] ?? fallback;
}
