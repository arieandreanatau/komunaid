-- KomunaID Remediation P0 Migration
-- Date: 2026-07-12
-- Changes: VARCHAR truncation fix, soft delete indexes, ReportStatus constants fix

-- ==========================================
-- 1. VARCHAR TRUNCATION FIXES
-- Change String (VARCHAR(191)) to @db.Text for long content fields
-- ==========================================

-- User.bio
ALTER TABLE `users` MODIFY COLUMN `bio` TEXT;

-- Community.description, adminNote
ALTER TABLE `communities` MODIFY COLUMN `description` TEXT;
ALTER TABLE `communities` MODIFY COLUMN `admin_note` TEXT;

-- Organization.description, adminNote
ALTER TABLE `organizations` MODIFY COLUMN `description` TEXT;
ALTER TABLE `organizations` MODIFY COLUMN `admin_note` TEXT;

-- Event.description
ALTER TABLE `events` MODIFY COLUMN `description` TEXT;

-- VolunteerOpportunity.description
ALTER TABLE `volunteer_opportunities` MODIFY COLUMN `description` TEXT;

-- VolunteerPosition.description, requirement
ALTER TABLE `volunteer_positions` MODIFY COLUMN `description` TEXT;
ALTER TABLE `volunteer_positions` MODIFY COLUMN `requirement` TEXT;

-- VolunteerApplication.motivation, experience, availability, reviewNote
ALTER TABLE `volunteer_applications` MODIFY COLUMN `motivation` TEXT;
ALTER TABLE `volunteer_applications` MODIFY COLUMN `experience` TEXT;
ALTER TABLE `volunteer_applications` MODIFY COLUMN `availability` TEXT;
ALTER TABLE `volunteer_applications` MODIFY COLUMN `review_note` TEXT;

-- Report.description, reviewNote
ALTER TABLE `reports` MODIFY COLUMN `description` TEXT;
ALTER TABLE `reports` MODIFY COLUMN `review_note` TEXT;

-- Category.description
ALTER TABLE `categories` MODIFY COLUMN `description` TEXT;

-- JoinRequest.message
ALTER TABLE `join_requests` MODIFY COLUMN `message` TEXT;

-- VolunteerAssignment.notes
ALTER TABLE `volunteer_assignments` MODIFY COLUMN `notes` TEXT;

-- ==========================================
-- 2. SOFT DELETE INDEXES
-- Add @@index([deletedAt]) for all models with deletedAt
-- ==========================================

-- User
CREATE INDEX `users_deletedAt_idx` ON `users` (`deletedAt`);

-- Community
CREATE INDEX `communities_deletedAt_idx` ON `communities` (`deletedAt`);

-- CommunityMember
CREATE INDEX `community_members_deletedAt_idx` ON `community_members` (`deletedAt`);

-- CommunityMedia
CREATE INDEX `community_media_deletedAt_idx` ON `community_media` (`deletedAt`);

-- Organization
CREATE INDEX `organizations_deletedAt_idx` ON `organizations` (`deletedAt`);

-- OrganizationMember
CREATE INDEX `organization_members_deletedAt_idx` ON `organization_members` (`deletedAt`);

-- Event
CREATE INDEX `events_deletedAt_idx` ON `events` (`deletedAt`);

-- VolunteerOpportunity
CREATE INDEX `volunteer_opportunities_deletedAt_idx` ON `volunteer_opportunities` (`deletedAt`);

-- Report
CREATE INDEX `reports_deletedAt_idx` ON `reports` (`deletedAt`);
