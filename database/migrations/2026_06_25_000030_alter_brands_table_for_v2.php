<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('owner_id')->constrained('companies')->nullOnDelete();
            }
            if (!Schema::hasColumn('brands', 'logo_path')) {
                $table->string('logo_path')->nullable()->after('logo');
            }
            if (!Schema::hasColumn('brands', 'website_url')) {
                $table->string('website_url')->nullable()->after('website');
            }
            if (!Schema::hasColumn('brands', 'instagram_url')) {
                $table->string('instagram_url')->nullable()->after('instagram');
            }
            if (!Schema::hasColumn('brands', 'email')) {
                $table->string('email')->nullable()->after('contact_email');
            }
            if (!Schema::hasColumn('brands', 'phone')) {
                $table->string('phone')->nullable()->after('contact_phone');
            }
            if (!Schema::hasColumn('brands', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('status');
            }
            if (!Schema::hasColumn('brands', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('is_featured');
            }
            if (!Schema::hasColumn('brands', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            }
        });

        $existingIndexes = collect(DB::select("SHOW INDEX FROM brands"))->pluck('Key_name')->toArray();
        Schema::table('brands', function (Blueprint $table) use ($existingIndexes) {
            if (!in_array('brands_status_index', $existingIndexes)) {
                $table->index('status');
            }
            if (!in_array('brands_slug_index', $existingIndexes)) {
                $table->index('slug');
            }
            if (!in_array('brands_owner_id_index', $existingIndexes)) {
                $table->index('owner_id');
            }
            if (!in_array('brands_company_id_index', $existingIndexes)) {
                $table->index('company_id');
            }
            if (!in_array('brands_is_featured_index', $existingIndexes)) {
                $table->index('is_featured');
            }
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            if (Schema::hasColumn('brands', 'company_id')) {
                $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'brands' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME LIKE '%company_id%'");
                foreach ($fks as $fk) {
                    $table->dropForeign($fk->CONSTRAINT_NAME);
                }
            }
        });

        Schema::table('brands', function (Blueprint $table) {
            $columns = [
                'company_id', 'logo_path', 'website_url', 'instagram_url',
                'email', 'phone', 'is_featured', 'created_by', 'updated_by',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('brands', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
