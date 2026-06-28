<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE brand_members MODIFY COLUMN status " .
            "enum('pending','active','rejected','suspended','inactive') NOT NULL DEFAULT 'pending'");

        // Ensure community_members.status already has 'pending' default
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE brand_members MODIFY COLUMN status enum('pending','active','inactive') NOT NULL DEFAULT 'pending'");
    }
};
