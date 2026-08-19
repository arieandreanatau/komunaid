-- Reconcile migration history with the checked-in Prisma schema.
-- Safe for databases that already applied earlier migrations.

ALTER TABLE `community_media`
  MODIFY COLUMN `type` ENUM('ANNOUNCEMENT', 'NEWS', 'GALLERY', 'FORUM_POST') NOT NULL DEFAULT 'ANNOUNCEMENT';

CREATE TABLE `forum_replies` (
  `id` VARCHAR(191) NOT NULL,
  `threadId` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `createdById` VARCHAR(191) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `forum_replies_threadId_idx`(`threadId`),
  INDEX `forum_replies_createdAt_idx`(`createdAt`),
  INDEX `forum_replies_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `forum_replies_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `community_media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `forum_replies_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `familyId` VARCHAR(191) NOT NULL,
  `fingerprint` VARCHAR(191) NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(191) NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT false,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
  INDEX `refresh_tokens_userId_idx`(`userId`),
  INDEX `refresh_tokens_familyId_idx`(`familyId`),
  INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
  INDEX `refresh_tokens_userId_isRevoked_idx`(`userId`, `isRevoked`),
  PRIMARY KEY (`id`),
  CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `join_requests_organizationId_userId_key`
  ON `join_requests`(`organizationId`, `userId`);
