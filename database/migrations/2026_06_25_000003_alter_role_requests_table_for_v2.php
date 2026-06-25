<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('role_requests', function (Blueprint $table) {
            $table->text('reason')->nullable()->after('notes');
            $table->json('payload')->nullable()->after('reason');
            $table->dropColumn('notes');
        });
    }

    public function down(): void
    {
        Schema::table('role_requests', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('reviewed_at');
            $table->dropColumn(['reason', 'payload']);
        });
    }
};
