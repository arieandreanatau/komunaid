import type { Prisma } from "@prisma/client";

const DANGEROUS_PATTERNS = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
  /<object\b[^>]*>[\s\S]*?<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<applet\b[^>]*>[\s\S]*?<\/applet>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:[^,]*;base64/gi,
  /on\w+\s*=/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*['"]?\s*javascript/gi,
  /<!--[\s\S]*?-->/g,
  /<svg\b[^>]*on\w+/gi,
  /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
  /style\s*=\s*["'][^"']*expression/gi,
  /<meta\b[^>]*http-equiv/gi,
  /<link\b[^>]*href\s*=\s*["']?\s*javascript/gi,
  /<base\b[^>]*href\s*=\s*["']?\s*javascript/gi,
  /formaction\s*=/gi,
  /<form\b[^>]*action\s*=\s*["']?\s*javascript/gi,
];

const TEXT_FIELD_PATTERNS: Record<string, RegExp> = {
  name: /^[^<>]*$/,
  description: /^[^<>]*$/,
  title: /^[^<>]*$/,
  bio: /^[^<>]*$/,
  location: /^[^<>]*$/,
  message: /^[^<>]*$/,
  contactName: /^[^<>]*$/,
  adminNote: /^[^<>]*$/,
};

function containsDangerousContent(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

function stripHtml(value: string): string {
  let result = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();

  if (containsDangerousContent(result)) {
    result = result
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
      .replace(/<embed\b[^>]*>/gi, "")
      .replace(/<applet\b[^>]*>[\s\S]*?<\/applet>/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/vbscript\s*:/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, "")
      .trim();
  }

  return result;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return stripHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key]);
    }
    return sanitized;
  }
  return value;
}

export function xssSanitize(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const obj = data as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const pattern = TEXT_FIELD_PATTERNS[key];
    const value = obj[key];
    if (pattern && typeof value === "string") {
      if (!pattern.test(value)) {
        sanitized[key] = stripHtml(value);
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = sanitizeValue(value);
    }
  }

  return sanitized;
}

export function sanitizeText(value: string | null | undefined): string | null {
  if (value == null) return null;
  return stripHtml(value);
}
