<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaboration_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('proposer_type');
            $table->unsignedBigInteger('proposer_id');
            $table->string('target_type');
            $table->unsignedBigInteger('target_id');
            $table->foreignId('collaboration_type_id')->nullable()->constrained('collaboration_types')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('objective')->nullable();
            $table->text('target_audience')->nullable();
            $table->text('benefit_for_brand')->nullable();
            $table->text('benefit_for_community')->nullable();
            $table->decimal('estimated_budget', 15, 2)->nullable();
            $table->text('timeline')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('sent_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('response_note')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['proposer_type', 'proposer_id']);
            $table->index(['target_type', 'target_id']);
            $table->index('status');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_proposals');
    }
};
