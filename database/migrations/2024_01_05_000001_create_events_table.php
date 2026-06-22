<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained('communities')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('event_type', ['free', 'paid', 'collaboration'])->default('free');
            $table->enum('location_type', ['online', 'offline', 'hybrid'])->default('offline');
            $table->string('location_address')->nullable();
            $table->datetime('start_datetime');
            $table->datetime('end_datetime');
            $table->integer('capacity')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('platform_fee', 15, 2)->default(0);
            $table->decimal('admin_fee', 15, 2)->default(0);
            $table->boolean('discount_enabled')->default(false);
            $table->string('discount_type')->nullable();
            $table->decimal('discount_value', 15, 2)->nullable();
            $table->enum('registration_status', ['open', 'closed'])->default('open');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->boolean('eo_by_platform')->default(false);
            $table->decimal('eo_fee', 15, 2)->default(0);
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['community_id', 'event_type']);
            $table->index(['start_datetime', 'end_datetime']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
