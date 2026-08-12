-- Community coordinator role is scoped to volunteer operations.
ALTER TABLE `community_members` MODIFY COLUMN `role` ENUM('OWNER', 'ADMIN', 'EVENT_MANAGER', 'VOLUNTEER_COORDINATOR', 'MEMBER') NOT NULL DEFAULT 'MEMBER';

CREATE TABLE `volunteer_programs` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `location` VARCHAR(200) NULL,
  `capacity` INTEGER NOT NULL,
  `registrationDeadline` DATETIME(3) NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'REJECTED', 'APPROVED', 'SCHEDULED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `organizerType` ENUM('COMMUNITY', 'INDEPENDENT') NOT NULL,
  `communityId` VARCHAR(191) NULL,
  `organizerUserId` VARCHAR(191) NOT NULL,
  `reviewNote` TEXT NULL,
  `reviewedAt` DATETIME(3) NULL,
  `reviewedById` VARCHAR(191) NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `volunteer_programs_slug_key`(`slug`),
  INDEX `volunteer_programs_communityId_status_idx`(`communityId`, `status`),
  INDEX `volunteer_programs_organizerUserId_status_idx`(`organizerUserId`, `status`),
  INDEX `volunteer_programs_organizerType_status_idx`(`organizerType`, `status`),
  INDEX `volunteer_programs_status_startDate_idx`(`status`, `startDate`),
  INDEX `volunteer_programs_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `volunteer_programs_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `communities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `volunteer_programs_organizerUserId_fkey` FOREIGN KEY (`organizerUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `volunteer_programs_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `volunteer_program_organizer_accesses` (
  `id` VARCHAR(191) NOT NULL,
  `volunteerProgramId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `accessType` ENUM('PROGRAM_ORGANIZER') NOT NULL DEFAULT 'PROGRAM_ORGANIZER',
  `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `startsAt` DATETIME(3) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `volunteer_program_organizer_accesses_volunteerProgramId_userId_key`(`volunteerProgramId`, `userId`),
  INDEX `volunteer_program_organizer_accesses_userId_status_expiresAt_idx`(`userId`, `status`, `expiresAt`),
  INDEX `volunteer_program_organizer_accesses_volunteerProgramId_status_idx`(`volunteerProgramId`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `volunteer_program_organizer_accesses_program_fkey` FOREIGN KEY (`volunteerProgramId`) REFERENCES `volunteer_programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `volunteer_program_organizer_accesses_user_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `volunteer_program_applications` (
  `id` VARCHAR(191) NOT NULL,
  `volunteerProgramId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `motivation` TEXT NULL,
  `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ORGANIZER') NOT NULL DEFAULT 'PENDING',
  `cancellationReason` TEXT NULL,
  `reviewedAt` DATETIME(3) NULL,
  `reviewedById` VARCHAR(191) NULL,
  `reviewNote` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `volunteer_program_applications_volunteerProgramId_userId_key`(`volunteerProgramId`, `userId`),
  INDEX `volunteer_program_applications_userId_status_idx`(`userId`, `status`),
  INDEX `volunteer_program_applications_volunteerProgramId_status_idx`(`volunteerProgramId`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `volunteer_program_applications_program_fkey` FOREIGN KEY (`volunteerProgramId`) REFERENCES `volunteer_programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `volunteer_program_applications_user_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `volunteer_program_applications_reviewer_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `volunteer_program_participations` (
  `id` VARCHAR(191) NOT NULL,
  `applicationId` VARCHAR(191) NOT NULL,
  `status` ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
  `attendance` ENUM('NOT_RECORDED', 'ATTENDED', 'NO_SHOW') NOT NULL DEFAULT 'NOT_RECORDED',
  `attendedAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `volunteer_program_participations_applicationId_key`(`applicationId`),
  INDEX `volunteer_program_participations_status_idx`(`status`),
  INDEX `volunteer_program_participations_attendance_idx`(`attendance`),
  PRIMARY KEY (`id`),
  CONSTRAINT `volunteer_program_participations_application_fkey` FOREIGN KEY (`applicationId`) REFERENCES `volunteer_program_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
