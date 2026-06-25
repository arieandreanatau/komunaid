<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
            $table->unsignedBigInteger('created_by');
            $table->string('type');
            $table->string('title');
            $table->string('slug')->nullable();
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->string('status')->default('draft');
            $table->text('requirements')->nullable();
            $table->json('positions')->nullable();
            $table->integer('quota')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['community_id', 'status']);
            $table->index('created_by');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_campaigns');
    }
};
