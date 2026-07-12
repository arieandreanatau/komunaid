import { Hono } from "hono";
import { ALLOWED_IMAGE_TYPES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { createChildLogger } from "../lib/logger";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser } };

const log = createChildLogger("upload");

export const uploadRoutes = new Hono<Env>();

const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_TYPES;
const MAX_SIZE = 5 * 1024 * 1024;

const MAGIC_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function matchesMagic(buffer: Buffer, mime: string): boolean {
  const signatures = MAGIC_SIGNATURES[mime];
  if (!signatures || signatures.length === 0) return false;
  return signatures.some((sig) => buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte));
}

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return map[mime] || ".bin";
}

function generateFilename(mime: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}${getExtension(mime)}`;
}

uploadRoutes.post("/", authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || typeof file === "string") {
      return c.json({ success: false, message: "File wajib diupload" }, 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json({ success: false, message: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP" }, 400);
    }

    if (file.size > MAX_SIZE) {
      return c.json({ success: false, message: "Ukuran file maksimal 5MB" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!matchesMagic(buffer, file.type)) {
      return c.json({ success: false, message: "File tidak valid (format tidak cocok)" }, 400);
    }

    const { writeFile, mkdir } = await import("node:fs/promises");
    const { join } = await import("node:path");

    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
    const dateDir = new Date().toISOString().split("T")[0];
    const targetDir = join(uploadDir, dateDir);

    await mkdir(targetDir, { recursive: true });

    const filename = generateFilename(file.type);
    const filePath = join(targetDir, filename);

    await writeFile(filePath, buffer);

    const baseUrl = process.env.UPLOAD_BASE_URL || `/uploads/${dateDir}`;
    const fileUrl = `${baseUrl}/${filename}`;

    return c.json({ success: true, data: { url: fileUrl, type: file.type, size: file.size } });
  } catch (err: any) {
    log.error({ err }, "upload failed");
    return c.json({ success: false, message: "Gagal upload file" }, 500);
  }
});
