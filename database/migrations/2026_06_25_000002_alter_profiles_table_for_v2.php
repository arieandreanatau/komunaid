<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('username');
            $table->string('country')->default('Indonesia')->after('province');
            $table->text('address')->nullable()->after('country');
            $table->string('instagram_url')->nullable()->after('cover_photo');
            $table->string('linkedin_url')->nullable()->after('instagram_url');
            $table->string('website_url')->nullable()->after('linkedin_url');
            $table->string('privacy')->default('public')->after('website_url');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'display_name',
                'country',
                'address',
                'instagram_url',
                'linkedin_url',
                'website_url',
                'privacy',
            ]);
        });
    }
};
