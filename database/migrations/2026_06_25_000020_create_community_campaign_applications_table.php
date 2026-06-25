<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_campaign_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('community_campaigns')->cascadeOnDelete();
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

            $table->index(['campaign_id', 'status']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_campaign_applications');
    }
};
