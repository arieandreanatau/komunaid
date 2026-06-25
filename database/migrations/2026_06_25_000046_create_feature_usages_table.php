<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('feature_key');
            $table->integer('usage_count')->default(0);
            $table->integer('limit_count')->nullable();
            $table->timestamp('period_start')->nullable();
            $table->timestamp('period_end')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'feature_key']);
            $table->index('feature_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_usages');
    }
};
