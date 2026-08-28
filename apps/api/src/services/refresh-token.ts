import { randomBytes, createHash } from "crypto";
import { prisma } from "@komunaid/database";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("refresh-token");

const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY_DAYS || "30",
  10
);
const REFRESH_TOKEN_FAMILY_LIMIT = parseInt(
  process.env.REFRESH_TOKEN_FAMILY_LIMIT || "10",
  10
);

function generateFamilyId(): string {
  return randomBytes(16).toString("hex");
}

function generateToken(): string {
  return randomBytes(64).toString("hex");
}

function getExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return date;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createRefreshTokenFamily(
  userId: string,
  fingerprint?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ tokenHash: string; familyId: string }> {
  const familyId = generateFamilyId();
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getExpiryDate();

  const activeFamilyCount = await prisma.refreshToken.groupBy({
    by: ["familyId"],
    where: { userId, isRevoked: false },
  });

  if (activeFamilyCount.length >= REFRESH_TOKEN_FAMILY_LIMIT) {
    const oldestFamilies = await prisma.refreshToken.findMany({
      where: { userId, isRevoked: false },
      orderBy: { createdAt: "asc" },
      distinct: ["familyId"],
      select: { familyId: true },
      take: activeFamilyCount.length - REFRESH_TOKEN_FAMILY_LIMIT + 1,
    });

    for (const fam of oldestFamilies) {
      await revokeTokenFamily(fam.familyId);
    }

    log.warn(
      {
        userId,
        revokedFamilies: oldestFamilies.map((f) => f.familyId),
      },
      "Exceeded family limit, revoked oldest token families"
    );
  }

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      familyId,
      fingerprint,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  return { tokenHash: rawToken, familyId };
}

export async function rotateRefreshToken(
  oldTokenHash: string,
  userId: string,
  fingerprint?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ newTokenHash: string; familyId: string; reused: boolean; expired?: boolean }> {
  const oldToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldTokenHash },
  });

  if (!oldToken) {
    log.warn({ userId, tokenHash: oldTokenHash }, "Refresh token not found during rotation");
    return { newTokenHash: "", familyId: "unknown", reused: true };
  }

  if (oldToken.isRevoked) {
    log.error(
      {
        userId,
        familyId: oldToken.familyId,
        tokenHash: oldTokenHash,
      },
      "REUSE DETECTED: Revoked token was reused — revoking entire family"
    );

    await revokeTokenFamily(oldToken.familyId);

    return { newTokenHash: "", familyId: oldToken.familyId, reused: true };
  }

  if (oldToken.expiresAt < new Date()) {
    log.warn(
      { userId, familyId: oldToken.familyId, tokenHash: oldTokenHash },
      "Expired refresh token presented for rotation"
    );
    return { newTokenHash: "", familyId: oldToken.familyId, reused: false, expired: true };
  }

  const rawToken = generateToken();
  const newTokenHash = hashToken(rawToken);
  const expiresAt = getExpiryDate();

  const consumed = await prisma.$transaction(async (tx) => {
    // Consume once in DB. A stale concurrent reader must not mint another successor.
    const result = await tx.refreshToken.updateMany({
      where: { tokenHash: oldTokenHash, isRevoked: false },
      data: { isRevoked: true },
    });

    if (result.count !== 1) return false;

    await tx.refreshToken.create({
      data: {
        userId,
        tokenHash: newTokenHash,
        familyId: oldToken.familyId,
        fingerprint,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return true;
  });

  if (!consumed) {
    await revokeTokenFamily(oldToken.familyId);
    return { newTokenHash: "", familyId: oldToken.familyId, reused: true };
  }

  return { newTokenHash: rawToken, familyId: oldToken.familyId, reused: false };
}

export async function revokeTokenFamily(familyId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: { familyId, isRevoked: false },
    data: { isRevoked: true },
  });

  log.info(
    { familyId, revokedCount: result.count },
    "Token family revoked"
  );

  return result.count;
}

export async function revokeAllUserTokens(userId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  log.info(
    { userId, revokedCount: result.count },
    "All user tokens revoked"
  );

  return result.count;
}

export async function revokeToken(tokenHash: string): Promise<boolean> {
  try {
    const result = await prisma.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });

    return result.count > 0;
  } catch {
    return false;
  }
}

export async function validateRefreshToken(
  tokenHash: string
): Promise<{
  valid: boolean;
  userId: string;
  familyId: string;
  fingerprint?: string;
}> {
  const token = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: {
      userId: true,
      familyId: true,
      fingerprint: true,
      isRevoked: true,
      expiresAt: true,
    },
  });

  if (!token) {
    return { valid: false, userId: "", familyId: "" };
  }

  if (token.isRevoked) {
    return { valid: false, userId: token.userId, familyId: token.familyId };
  }

  if (token.expiresAt < new Date()) {
    return { valid: false, userId: token.userId, familyId: token.familyId };
  }

  return {
    valid: true,
    userId: token.userId,
    familyId: token.familyId,
    fingerprint: token.fingerprint ?? undefined,
  };
}

// Under the serverless (Vercel) topology nothing calls this on its own — there is
// no long-lived process to hold a setInterval. It requires an external scheduler;
// see apps/api/src/services/scheduled-work.ts, apps/api/src/routes/cron.ts and
// the "crons" entry in vercel.json.
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  if (result.count > 0) {
    log.info({ deletedCount: result.count }, "Expired tokens cleaned up");
  }

  return result.count;
}

export async function getActiveSessions(
  userId: string
): Promise<
  Array<{
    id: string;
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
    createdAt: Date;
  }>
> {
  const sessions = await prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    distinct: ["familyId"],
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      fingerprint: true,
      createdAt: true,
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    ipAddress: s.ipAddress ?? undefined,
    userAgent: s.userAgent ?? undefined,
    fingerprint: s.fingerprint ?? undefined,
    createdAt: s.createdAt,
  }));
}

export async function revokeSession(sessionId: string, userId?: string): Promise<boolean> {
  const token = await prisma.refreshToken.findUnique({
    where: { id: sessionId },
    select: { familyId: true, isRevoked: true, userId: true },
  });

  if (!token) return false;
  if (userId && token.userId !== userId) return false;

  const count = await revokeTokenFamily(token.familyId);
  return count > 0;
}
