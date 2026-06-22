<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE community_members MODIFY COLUMN role ENUM('member', 'volunteer', 'admin') DEFAULT 'member'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE community_members MODIFY COLUMN role ENUM('member', 'moderator', 'admin') DEFAULT 'member'");
    }
};
