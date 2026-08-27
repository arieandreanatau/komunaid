-- Reversible migration for the VolunteerProgram legacy mapping columns.
ALTER TABLE `volunteer_programs`
  DROP FOREIGN KEY `vp_event_fk`,
  DROP INDEX `vp_legacy_opportunity_uq`,
  DROP INDEX `vp_event_idx`,
  DROP COLUMN `eventId`,
  DROP COLUMN `legacyOpportunityId`;