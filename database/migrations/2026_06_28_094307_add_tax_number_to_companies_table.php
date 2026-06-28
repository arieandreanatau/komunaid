<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('companies', 'tax_number')) {
            Schema::table('companies', function (Blueprint $t) {
                $t->string('tax_number')->nullable()->after('legal_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('companies', 'tax_number')) {
            Schema::table('companies', function (Blueprint $t) {
                $t->dropColumn('tax_number');
            });
        }
    }
};
