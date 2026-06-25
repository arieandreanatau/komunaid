<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_categories', function (Blueprint $table) {
            $table->string('color')->nullable()->after('icon');
            $table->integer('sort_order')->nullable()->after('color');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('community_categories', function (Blueprint $table) {
            $table->dropColumn(['color', 'sort_order']);
            $table->dropSoftDeletes();
        });
    }
};
