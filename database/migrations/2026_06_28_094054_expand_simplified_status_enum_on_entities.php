<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Expand status enum on communities & brands to include all simplified statuses.
        // Companies already uses varchar.
        $newEnum = "enum('draft','pending','pending_approval','need_revision','approved','rejected','suspended','archived','inactive')";

        foreach (['communities', 'brands'] as $table) {
            DB::statement("ALTER TABLE {$table} MODIFY COLUMN status {$newEnum} NOT NULL DEFAULT 'pending_approval'");
        }
    }

    public function down(): void
    {
        $oldEnum = "enum('pending','approved','rejected','archived')";
        foreach (['communities', 'brands'] as $table) {
            DB::statement("ALTER TABLE {$table} MODIFY COLUMN status {$oldEnum} NOT NULL DEFAULT 'pending'");
        }
    }
};
