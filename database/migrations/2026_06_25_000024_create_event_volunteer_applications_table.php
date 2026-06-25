<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_volunteer_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_volunteer_campaign_id')->constrained('event_volunteer_campaigns')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('position_applied')->nullable();
            $table->text('motivation')->nullable();
            $table->json('answers')->nullable();
            $table->string('status')->default('submitted');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_volunteer_campaign_id', 'status'], 'evapp_campaign_status_idx');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_volunteer_applications');
    }
};
