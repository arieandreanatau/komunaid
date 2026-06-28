<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Expand community_members.role to include simplified flow values
        DB::statement("ALTER TABLE community_members MODIFY COLUMN role " .
            "enum('owner_candidate','owner','admin','core_team','volunteer','member') NOT NULL DEFAULT 'member'");

        // Expand community_members.status to include pending, rejected, suspended, inactive
        DB::statement("ALTER TABLE community_members MODIFY COLUMN status " .
            "enum('pending','active','rejected','suspended','inactive','banned','left') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE community_members MODIFY COLUMN role enum('member','volunteer','admin') NOT NULL DEFAULT 'member'");
        DB::statement("ALTER TABLE community_members MODIFY COLUMN status enum('active','banned','left') NOT NULL DEFAULT 'active'");
    }
};
