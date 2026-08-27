ALTER TABLE `communities`
  MODIFY `status` ENUM('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'ARCHIVED', 'REJECTED', 'REVISION_REQUIRED') NOT NULL DEFAULT 'PENDING';

CREATE TABLE `community_status_histories` (
  `id` VARCHAR(191) NOT NULL,
  `communityId` VARCHAR(191) NOT NULL,
  `fromStatus` ENUM('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'ARCHIVED', 'REJECTED', 'REVISION_REQUIRED') NOT NULL,
  `toStatus` ENUM('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'ARCHIVED', 'REJECTED', 'REVISION_REQUIRED') NOT NULL,
  `actorId` VARCHAR(191) NOT NULL,
  `actorRole` VARCHAR(191) NULL,
  `reason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `community_status_histories_communityId_createdAt_idx` (`communityId`, `createdAt`),
  INDEX `community_status_histories_actorId_idx` (`actorId`),
  CONSTRAINT `community_status_histories_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `community_status_histories_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
