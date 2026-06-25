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
            if (!Schema::hasColumn('events', 'status')) {
                $table->string('status')->default('draft')->after('visibility');
            }
            if (!Schema::hasColumn('events', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('eo_fee');
            }
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'status')) {
                $indexes = DB::select("SHOW INDEX FROM events WHERE Column_name = 'status'");
                foreach ($indexes as $index) {
                    $table->dropIndex($index->Key_name);
                }
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('events', 'is_featured')) {
                $indexes = DB::select("SHOW INDEX FROM events WHERE Column_name = 'is_featured'");
                foreach ($indexes as $index) {
                    $table->dropIndex($index->Key_name);
                }
                $table->dropColumn('is_featured');
            }
        });
    }
};
