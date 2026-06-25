<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('label')->nullable();
            $table->string('value')->nullable();
            $table->string('url')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->nullable();
            $table->timestamps();

            $table->index('key');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_settings');
    }
};
