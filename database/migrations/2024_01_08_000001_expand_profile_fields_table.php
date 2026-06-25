<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('interest');
            $table->string('gender')->nullable()->after('date_of_birth');
            $table->json('social_links')->nullable()->after('gender');
            $table->json('skills')->nullable()->after('social_links');
            $table->string('cover_photo')->nullable()->after('skills');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'social_links',
                'skills',
                'cover_photo',
            ]);
        });
    }
};
