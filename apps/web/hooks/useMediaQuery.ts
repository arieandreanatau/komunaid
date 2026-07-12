"use client";

import { useState, useEffect } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useMediaQuery(query: string | Breakpoint): boolean {
  const resolvedQuery =
    query in BREAKPOINTS
      ? `(min-width: ${BREAKPOINTS[query as Breakpoint]}px)`
      : query;

  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(resolvedQuery).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(resolvedQuery);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    setMatches(media.matches);
    return () => media.removeEventListener("change", listener);
  }, [resolvedQuery]);

  return matches;
}

export function useIsMobile() {
  return !useMediaQuery("md");
}

export function useIsDesktop() {
  return useMediaQuery("lg");
}
