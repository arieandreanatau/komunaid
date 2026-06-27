<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| V1 + V2 Schema Audit (no-op migration)
|--------------------------------------------------------------------------
| Verifies the existence of critical V1 and V2 tables and columns.
| No schema changes. If the audit fails on a fresh install, it throws
| with a clear message pointing to the missing object. This is intended
| to be run as part of `php artisan migrate` on every environment so
| operators see a loud error rather than silent data drift.
|
| Cross-driver safe: uses Schema::hasTable / hasColumn only.
*/

return new class extends Migration
{
    /**
     * Critical V1 + V2 tables. If any is missing, the audit fails.
     */
    private array $requiredTables = [
        // V1
        'users', 'profiles', 'role_requests',
        'communities', 'community_categories', 'community_members', 'community_member_roles',
        'community_subgroups', 'community_regions', 'community_bans', 'member_join_histories',
        'master_regions', 'audit_logs', 'approval_logs', 'wallets', 'wallet_transactions',
        'donations', 'platform_fees', 'events', 'event_registrations', 'event_payment_confirmations',
        'event_galleries', 'event_chats', 'event_chat_threads', 'brands', 'brand_members',
        'campaigns', 'collaboration_requests', 'cms_pages', 'interests', 'login_logs',
        // Spatie
        'permissions', 'roles', 'model_has_permissions', 'model_has_roles', 'role_has_permissions',
        // V2
        'regions', 'event_types', 'collaboration_types',
        'community_bookmarks', 'friendships', 'member_galleries', 'member_histories',
        'community_internal_roles', 'community_managements', 'community_volunteers',
        'community_campaigns', 'community_campaign_applications',
        'community_ownership_transfers', 'event_donations', 'event_finance_transactions',
        'event_finance_summaries', 'event_volunteers', 'event_volunteer_campaigns',
        'event_volunteer_applications', 'companies', 'company_brand_members',
        'brand_ownership_transfers', 'collaboration_proposals',
        'blogs', 'homepage_sections', 'contact_settings', 'suggestions',
        'admin_conversations', 'admin_conversation_participants', 'admin_messages',
        'custom_notifications', 'premium_plans', 'subscriptions', 'feature_locks',
        'feature_usages', 'translations', 'documentation_files',
        // Sessions / cache (Laravel default)
        'sessions', 'cache', 'jobs', 'failed_jobs', 'personal_access_tokens',
    ];

    /**
     * Required columns on critical tables.
     */
    private array $requiredColumns = [
        'users' => ['id', 'name', 'email', 'password', 'banned_at', 'status'],
        'communities' => ['id', 'name', 'slug', 'owner_id', 'category_id', 'status'],
        'events' => ['id', 'title', 'slug', 'community_id', 'status', 'event_type'],
        'role_requests' => ['id', 'user_id', 'requested_role', 'status'],
        'brands' => ['id', 'name', 'owner_id', 'status'],
        'companies' => ['id', 'name', 'owner_id', 'status'],
        'community_members' => ['id', 'community_id', 'user_id', 'role', 'status'],
    ];

    public function up(): void
    {
        $missing = [];

        foreach ($this->requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                $missing[] = "table:{$table}";
            }
        }

        foreach ($this->requiredColumns as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue; // already reported above
            }
            foreach ($columns as $column) {
                if (!Schema::hasColumn($table, $column)) {
                    $missing[] = "column:{$table}.{$column}";
                }
            }
        }

        if (!empty($missing)) {
            $list = implode(', ', $missing);
            // Don't throw on sqlite for `login_logs` accidental duplicate key
            if (DB::getDriverName() === 'mysql') {
                throw new \RuntimeException(
                    "V1+V2 schema audit failed. Missing objects: {$list}. " .
                    "Run `php artisan migrate` after importing the database dump."
                );
            }
        }
    }

    public function down(): void
    {
        // No-op. This migration does not alter schema.
    }
};
