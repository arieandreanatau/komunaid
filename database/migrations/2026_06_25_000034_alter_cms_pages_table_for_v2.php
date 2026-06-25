<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->string('key')->unique()->after('id');
            $table->text('meta_title')->nullable()->after('meta');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('status')->default('draft')->after('is_published');
            $table->string('language_code')->default('id')->after('status');
            $table->unsignedBigInteger('created_by')->nullable()->after('language_code');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            $table->timestamp('published_at')->nullable()->after('updated_by');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropColumn([
                'key',
                'meta_title',
                'meta_description',
                'status',
                'language_code',
                'created_by',
                'updated_by',
                'published_at',
            ]);
            $table->dropSoftDeletes();
        });
    }
};
