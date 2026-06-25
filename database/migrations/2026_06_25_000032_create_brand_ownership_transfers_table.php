<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brand_ownership_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->unsignedBigInteger('old_owner_id');
            $table->unsignedBigInteger('new_owner_id');
            $table->unsignedBigInteger('transferred_by');
            $table->text('reason')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('brand_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_ownership_transfers');
    }
};
