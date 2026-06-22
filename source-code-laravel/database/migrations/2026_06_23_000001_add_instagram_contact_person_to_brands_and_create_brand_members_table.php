<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('instagram')->nullable()->after('website');
            $table->string('contact_person')->nullable()->after('contact_phone');
        });

        Schema::create('brand_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('staff');
            $table->enum('status', ['pending', 'active', 'inactive'])->default('active');
            $table->json('permissions')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['brand_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_members');
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['instagram', 'contact_person']);
        });
    }
};
