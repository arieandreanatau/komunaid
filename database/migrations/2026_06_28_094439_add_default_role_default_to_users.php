<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Backfill nulls to 'member'/'active' to allow tightening the column.
        DB::table('users')->whereNull('default_role')->update(['default_role' => 'member']);
        DB::table('users')->whereNull('status')->update(['status' => 'active']);
        DB::table('users')->where('default_role', '')->update(['default_role' => 'member']);
        DB::table('users')->where('status', '')->update(['status' => 'active']);

        DB::statement("ALTER TABLE users MODIFY COLUMN default_role VARCHAR(255) NOT NULL DEFAULT 'member'");
        DB::statement("ALTER TABLE users MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN default_role VARCHAR(255) NULL");
        DB::statement("ALTER TABLE users MODIFY COLUMN status VARCHAR(255) NULL");
    }
};
