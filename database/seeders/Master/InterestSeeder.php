<?php

namespace Database\Seeders\Master;

use App\Models\Interest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InterestSeeder extends Seeder
{
    public function run(): void
    {
        $interests = [
            'Teknologi',
            'Pemrograman',
            'Desain',
            'Bisnis',
            'Kuliner',
            'Olahraga',
            'Musik',
            'Fotografi',
            'Traveling',
            'Kesehatan',
            'Pendidikan',
            'Sosial',
            'Lingkungan',
            'Seni',
            'Game',
        ];

        foreach ($interests as $name) {
            Interest::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}
