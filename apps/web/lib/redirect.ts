const INTERNAL_PATHS = ["/dashboard", "/communities", "/events", "/organizations", "/volunteer", "/admin", "/settings"];

export function safeRedirect(path: string | null, fallback: string): string {
  if (path?.startsWith("/") && INTERNAL_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return path;
  }
  return fallback;
}
