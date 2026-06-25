<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('translatable_type');
            $table->unsignedBigInteger('translatable_id');
            $table->string('field');
            $table->string('language_code', 10);
            $table->longText('value');
            $table->timestamps();

            $table->unique(['translatable_type', 'translatable_id', 'field', 'language_code'], 'trans_unique_idx');
            $table->index(['translatable_type', 'translatable_id'], 'trans_poly_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
