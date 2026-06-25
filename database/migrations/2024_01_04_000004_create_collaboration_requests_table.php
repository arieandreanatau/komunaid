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
                $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
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
                $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
                $table->text('response_notes')->nullable();
                $table->timestamp('responded_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_requests');
    }
};
