<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $indexes = DB::select("SHOW INDEX FROM users WHERE Column_name = 'email' AND Non_unique = 0");
            foreach ($indexes as $index) {
                $table->dropIndex($index->Key_name);
            }
            $table->string('email')->nullable()->unique()->change();
        });
    }

    public function down(): void
    {
        DB::table('users')->whereNull('email')->delete();

        $indexes = DB::select("SHOW INDEX FROM users WHERE Column_name = 'email' AND Non_unique = 0");
        foreach ($indexes as $index) {
            Schema::table('users', function (Blueprint $table) use ($index) {
                $table->dropIndex($index->Key_name);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->unique()->change();
        });
    }
};
