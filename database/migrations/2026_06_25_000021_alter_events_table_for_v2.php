<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->text('short_description')->nullable()->after('description');
            $table->string('banner_path')->nullable()->after('short_description');
            $table->foreignId('type_id')->nullable()->after('banner_path')->constrained('event_types')->nullOnDelete();
            $table->string('location_name')->nullable()->after('location_address');
            $table->string('city')->nullable()->after('location_name');
            $table->string('province')->nullable()->after('city');
            $table->string('online_url')->nullable()->after('province');
            $table->string('registration_type')->default('open')->after('approval_status');
            $table->boolean('is_charity')->default(false)->after('registration_type');
            $table->boolean('is_open_volunteer')->default(false)->after('is_charity');
            $table->boolean('is_open_donation')->default(false)->after('is_open_volunteer');
            $table->boolean('is_featured')->default(false)->after('is_open_donation');
            $table->string('status')->default('draft')->after('is_featured');
            $table->unsignedBigInteger('created_by')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'type_id')) {
                $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME LIKE '%type_id%'");
                foreach ($fks as $fk) {
                    $table->dropForeign($fk->CONSTRAINT_NAME);
                }
            }
        });

        Schema::table('events', function (Blueprint $table) {
            $columns = [
                'short_description', 'banner_path', 'type_id', 'location_name',
                'city', 'province', 'online_url', 'registration_type',
                'is_charity', 'is_open_volunteer', 'is_open_donation',
                'is_featured', 'status', 'created_by',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('events', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
