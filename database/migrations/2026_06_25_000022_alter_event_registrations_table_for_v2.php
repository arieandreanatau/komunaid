<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable()->after('notes');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->timestamp('cancelled_at')->nullable()->after('approved_at');
            $table->timestamp('attendance_at')->nullable()->after('cancelled_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at', 'cancelled_at', 'attendance_at']);
            $table->dropSoftDeletes();
        });
    }
};
