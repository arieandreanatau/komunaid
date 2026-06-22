<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('collaboration_requests')) {
            Schema::create('collaboration_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('brand_id')->nullable()->constrained('brands')->cascadeOnDelete();
                $table->foreignId('sender_community_id')->nullable()->constrained('communities')->nullOnDelete();
                $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->string('collaboration_type');
                $table->string('title');
                $table->text('proposal')->nullable();
                $table->decimal('budget', 15, 2)->nullable();
                $table->date('event_date')->nullable();
                $table->string('contact_person')->nullable();
                $table->string('contact_email')->nullable();
                $table->string('contact_phone')->nullable();
                $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled', 'completed'])->default('pending');
                $table->text('response_notes')->nullable();
                $table->timestamp('responded_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('collaboration_requests', function (Blueprint $table) {
                if (!Schema::hasColumn('collaboration_requests', 'sender_community_id')) {
                    $table->foreignId('sender_community_id')->nullable()->after('brand_id')->constrained('communities')->nullOnDelete();
                }
                $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled', 'completed'])->default('pending')->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('collaboration_requests', 'sender_community_id')) {
            Schema::table('collaboration_requests', function (Blueprint $table) {
                $table->dropForeign(['sender_community_id']);
                $table->dropColumn('sender_community_id');
            });
        }
    }
};
