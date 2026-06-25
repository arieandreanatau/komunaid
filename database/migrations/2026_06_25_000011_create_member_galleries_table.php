<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->string('image_path');
            $table->text('caption')->nullable();
            $table->date('activity_date')->nullable();
            $table->string('visibility')->default('public');
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('visibility');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_galleries');
    }
};
