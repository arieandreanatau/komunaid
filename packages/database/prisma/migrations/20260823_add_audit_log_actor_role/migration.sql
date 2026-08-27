ALTER TABLE `audit_logs` ADD COLUMN `actorRole` VARCHAR(191) NULL;
CREATE INDEX `audit_logs_actorRole_idx` ON `audit_logs`(`actorRole`);

-- ROLLBACK:
-- DROP INDEX `audit_logs_actorRole_idx` ON `audit_logs`;
-- ALTER TABLE `audit_logs` DROP COLUMN `actorRole`;