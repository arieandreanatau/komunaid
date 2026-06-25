<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->longText('content')->nullable();
            $table->string('image_path')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->integer('sort_order')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('language_code')->default('id');
            $table->timestamps();
            $table->softDeletes();

            $table->index('key');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};
