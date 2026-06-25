<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_locks', function (Blueprint $table) {
            $table->id();
            $table->string('feature_key')->unique();
            $table->string('feature_name');
            $table->text('description')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_trial_available')->default(true);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_locks');
    }
};
