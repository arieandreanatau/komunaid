<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_conversations', function (Blueprint $table) {
            $table->timestamp('last_message_at')->nullable()->after('created_by');
            $table->string('status')->default('active')->after('last_message_at');
        });

        Schema::table('admin_conversation_participants', function (Blueprint $table) {
            $table->string('role')->default('member')->after('user_id');
            $table->boolean('is_muted')->default(false)->after('role');
            $table->timestamp('last_read_at')->nullable()->after('is_muted');
            $table->timestamp('archived_at')->nullable()->after('last_read_at');
            $table->softDeletes()->after('left_at');
        });

        Schema::table('admin_messages', function (Blueprint $table) {
            $table->string('message_type')->default('text')->after('message');
            $table->json('metadata')->nullable()->after('message_type');
            $table->timestamp('edited_at')->nullable()->after('metadata');
        });
    }

    public function down(): void
    {
        Schema::table('admin_conversations', function (Blueprint $table) {
            $table->dropColumn(['last_message_at', 'status']);
        });

        Schema::table('admin_conversation_participants', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_muted', 'last_read_at', 'archived_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('admin_messages', function (Blueprint $table) {
            $table->dropColumn(['message_type', 'metadata', 'edited_at']);
        });
    }
};
