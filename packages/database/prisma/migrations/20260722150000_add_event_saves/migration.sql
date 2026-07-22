CREATE TABLE `event_saves` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `event_saves_eventId_userId_key`(`eventId`, `userId`),
    INDEX `event_saves_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `event_saves`
    ADD CONSTRAINT `event_saves_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `events`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `event_saves`
    ADD CONSTRAINT `event_saves_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
