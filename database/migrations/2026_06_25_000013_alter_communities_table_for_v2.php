<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->text('short_description')->nullable()->after('banner');
            $table->string('location_type')->default('online')->after('visibility');
            $table->string('province')->nullable()->after('city');
            $table->string('country')->default('Indonesia')->after('province');
            $table->text('address')->nullable()->after('country');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->string('instagram_url')->nullable()->after('instagram');
            $table->string('website_url')->nullable()->after('website');
            $table->integer('member_count')->default(0)->after('max_members');
            $table->boolean('is_recommended')->default(false)->after('member_count');
            $table->boolean('is_featured')->default(false)->after('is_recommended');
            $table->unsignedBigInteger('created_by')->nullable()->after('is_featured');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');

            $table->index('status');
            $table->index('slug');
            $table->index('owner_id');
            $table->index('is_featured');
            $table->index('is_recommended');
        });
    }

    public function down(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn([
                'short_description',
                'location_type',
                'province',
                'country',
                'address',
                'contact_phone',
                'instagram_url',
                'website_url',
                'member_count',
                'is_recommended',
                'is_featured',
                'created_by',
                'updated_by',
            ]);
        });
    }
};
