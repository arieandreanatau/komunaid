ALTER TABLE `events`
  ADD COLUMN `registrationOpensAt` DATETIME(3) NULL,
  ADD COLUMN `registrationDeadline` DATETIME(3) NULL,
  ADD INDEX `events_registrationOpensAt_idx`(`registrationOpensAt`),
  ADD INDEX `events_registrationDeadline_idx`(`registrationDeadline`);
