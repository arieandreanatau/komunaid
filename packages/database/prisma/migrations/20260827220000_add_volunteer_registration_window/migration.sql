ALTER TABLE `volunteer_programs`
  ADD COLUMN `registrationOpensAt` DATETIME(3) NULL,
  ADD INDEX `vp_registration_opens_at_idx`(`registrationOpensAt`);
