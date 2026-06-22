<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->string('instagram')->nullable()->after('contact_email');
            $table->string('social_media')->nullable()->after('instagram');
            $table->enum('community_type', ['open', 'closed'])->default('open')->after('social_media');
            $table->enum('visibility', ['public', 'private'])->default('public')->after('community_type');
        });
    }

    public function down(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn(['instagram', 'social_media', 'community_type', 'visibility']);
        });
    }
};
