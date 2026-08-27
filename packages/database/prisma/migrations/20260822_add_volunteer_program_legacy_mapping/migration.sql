-- VolunteerProgram legacy mapping columns (VolunteerOpportunity -> VolunteerProgram cutover).
ALTER TABLE `volunteer_programs`
  ADD COLUMN `legacyOpportunityId` VARCHAR(191) NULL,
  ADD COLUMN `eventId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `vp_legacy_opportunity_uq`(`legacyOpportunityId`),
  ADD INDEX `vp_event_idx`(`eventId`),
  ADD CONSTRAINT `vp_event_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;