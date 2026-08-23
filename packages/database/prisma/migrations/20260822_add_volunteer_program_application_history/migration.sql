CREATE TABLE `volunteer_program_application_histories` (
  `id` VARCHAR(191) NOT NULL,
  `applicationId` VARCHAR(191) NOT NULL,
  `previousStatus` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ORGANIZER') NOT NULL,
  `newStatus` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ORGANIZER') NOT NULL,
  `actorId` VARCHAR(191) NOT NULL,
  `actorRole` VARCHAR(191) NULL,
  `reason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `vpah_application_created_idx`(`applicationId`, `createdAt`),
  INDEX `vpah_actor_idx`(`actorId`),
  CONSTRAINT `vpah_application_fk` FOREIGN KEY (`applicationId`) REFERENCES `volunteer_program_applications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vpah_actor_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
