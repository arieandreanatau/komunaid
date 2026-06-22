<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewed_by')->constrained('users');
            $table->string('type');
            $table->unsignedBigInteger('approvable_id');
            $table->string('approvable_type');
            $table->string('action');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['approvable_type', 'approvable_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
    }
};
