-- Reconcile remaining schema-vs-migration contract differences.

ALTER TABLE `activity_history` MODIFY COLUMN `details` JSON NULL;
ALTER TABLE `audit_logs` MODIFY COLUMN `beforeData` JSON NULL;
ALTER TABLE `audit_logs` MODIFY COLUMN `afterData` JSON NULL;
ALTER TABLE `community_statistics` MODIFY COLUMN `metadata` JSON NULL;
ALTER TABLE `membership_history` MODIFY COLUMN `details` JSON NULL;
ALTER TABLE `settings` MODIFY COLUMN `value` JSON NOT NULL;

CREATE INDEX `community_members_communityId_status_idx`
  ON `community_members`(`communityId`, `status`);
CREATE INDEX `organization_members_organizationId_status_idx`
  ON `organization_members`(`organizationId`, `status`);
CREATE INDEX `event_registrations_eventId_status_idx`
  ON `event_registrations`(`eventId`, `status`);
CREATE INDEX `events_organizationId_status_eventDate_idx`
  ON `events`(`organizationId`, `status`, `eventDate`);
