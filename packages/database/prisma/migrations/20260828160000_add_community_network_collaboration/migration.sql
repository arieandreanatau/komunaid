CREATE TABLE `community_network_relationships` (
  `id` VARCHAR(191) NOT NULL,
  `requesterId` VARCHAR(191) NOT NULL,
  `targetId` VARCHAR(191) NOT NULL,
  `status` ENUM('REQUESTED', 'ACCEPTED', 'DECLINED', 'REMOVED') NOT NULL DEFAULT 'REQUESTED',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `community_network_relationships_requesterId_targetId_key` (`requesterId`, `targetId`),
  INDEX `community_network_relationships_requesterId_status_idx` (`requesterId`, `status`),
  INDEX `community_network_relationships_targetId_status_idx` (`targetId`, `status`),
  CONSTRAINT `community_network_relationships_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `community_network_relationships_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `collaborations` (
  `id` VARCHAR(191) NOT NULL,
  `communityAId` VARCHAR(191) NOT NULL,
  `communityBId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('DRAFT', 'INVITED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `targetType` ENUM('EVENT', 'VOLUNTEER') NOT NULL,
  `targetEventId` VARCHAR(191) NULL,
  `targetProgramId` VARCHAR(191) NULL,
  `createdById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `collaborations_communityAId_status_idx` (`communityAId`, `status`),
  INDEX `collaborations_communityBId_status_idx` (`communityBId`, `status`),
  INDEX `collaborations_createdById_idx` (`createdById`),
  INDEX `collaborations_status_idx` (`status`),
  CONSTRAINT `collaborations_communityAId_fkey` FOREIGN KEY (`communityAId`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collaborations_communityBId_fkey` FOREIGN KEY (`communityBId`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collaborations_targetEventId_fkey` FOREIGN KEY (`targetEventId`) REFERENCES `events` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `collaborations_targetProgramId_fkey` FOREIGN KEY (`targetProgramId`) REFERENCES `volunteer_programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `collaborations_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
