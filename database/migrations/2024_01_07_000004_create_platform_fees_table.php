<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_registration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_payment_confirmation_id')->constrained()->cascadeOnDelete();
            $table->decimal('gross_amount', 15, 2);
            $table->decimal('platform_fee_amount', 15, 2);
            $table->decimal('community_net_amount', 15, 2);
            $table->decimal('platform_fee_percent', 5, 2)->default(10);
            $table->enum('status', ['recorded', 'paid_out'])->default('recorded');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_fees');
    }
};
