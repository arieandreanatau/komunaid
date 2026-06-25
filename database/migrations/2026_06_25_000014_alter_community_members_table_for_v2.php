<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_members', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable()->after('ban_reason');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->timestamp('left_at')->nullable()->after('approved_at');
            $table->text('notes')->nullable()->after('left_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('community_members', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at', 'left_at', 'notes']);
            $table->dropSoftDeletes();
        });
    }
};
