<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        foreach (['communities', 'brands', 'companies'] as $table) {
            if (! Schema::hasColumn($table, 'approved_by')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->foreignId('approved_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
                });
            }
            if (! Schema::hasColumn($table, 'approved_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->timestamp('approved_at')->nullable()->after('approved_by');
                });
            }
            if (! Schema::hasColumn($table, 'rejection_reason')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->text('rejection_reason')->nullable()->after('approved_at');
                });
            }
            if (! Schema::hasColumn($table, 'revision_notes')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->text('revision_notes')->nullable()->after('rejection_reason');
                });
            }
            if (! Schema::hasColumn($table, 'submitted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->timestamp('submitted_at')->nullable()->after('revision_notes');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['communities', 'brands', 'companies'] as $table) {
            foreach (['approved_by', 'approved_at', 'rejection_reason', 'revision_notes', 'submitted_at'] as $col) {
                if (Schema::hasColumn($table, $col)) {
                    Schema::table($table, function (Blueprint $t) use ($col) {
                        $t->dropColumn($col);
                    });
                }
            }
        }
    }
};
