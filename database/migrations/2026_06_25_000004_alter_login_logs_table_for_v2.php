<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('login_logs', function (Blueprint $table) {
            $table->string('email_or_username')->nullable()->after('user_id');
            $table->timestamp('logged_in_at')->nullable()->after('success');
        });
    }

    public function down(): void
    {
        Schema::table('login_logs', function (Blueprint $table) {
            $table->dropColumn(['email_or_username', 'logged_in_at']);
        });
    }
};
