<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $columnType = DB::select("SHOW COLUMNS FROM events WHERE Field = 'event_type'");
            if (!empty($columnType) && str_contains($columnType[0]->Type, 'enum')) {
                DB::statement("ALTER TABLE events MODIFY event_type VARCHAR(255) NOT NULL DEFAULT 'free'");
            }
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            DB::statement("UPDATE events SET event_type = 'free' WHERE event_type NOT IN ('free', 'paid', 'collaboration')");
            $table->enum('event_type', ['free', 'paid', 'collaboration'])->default('free')->change();
        });
    }
};
