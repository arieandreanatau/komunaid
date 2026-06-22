<?php

namespace Database\Seeders;

use App\Models\CommunityCategory;
use Illuminate\Database\Seeder;

class CommunityCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Teknologi', 'slug' => 'teknologi', 'description' => 'Komunitas seputar teknologi, programming, dan digital', 'icon' => '💻', 'is_active' => true],
            ['name' => 'Bisnis & Startup', 'slug' => 'bisnis-startup', 'description' => 'Komunitas entrepreneur, startup, dan bisnis', 'icon' => '🚀', 'is_active' => true],
            ['name' => 'Desain & Kreatif', 'slug' => 'desain-kreatif', 'description' => 'Komunitas desainer, ilustrator, dan kreatif', 'icon' => '🎨', 'is_active' => true],
            ['name' => 'Olahraga', 'slug' => 'olahraga', 'description' => 'Komunitas olahraga dan fitness', 'icon' => '⚽', 'is_active' => true],
            ['name' => 'Pendidikan', 'slug' => 'pendidikan', 'description' => 'Komunitas belajar, kursus, dan edukasi', 'icon' => '📚', 'is_active' => true],
            ['name' => 'Musik & Seni', 'slug' => 'musik-seni', 'description' => 'Komunitas musisi, seniman, dan pekerja seni', 'icon' => '🎵', 'is_active' => true],
            ['name' => 'Lingkungan', 'slug' => 'lingkungan', 'description' => 'Komunitas pelestari lingkungan dan sustainability', 'icon' => '🌿', 'is_active' => true],
            ['name' => 'Kuliner', 'slug' => 'kuliner', 'description' => 'Komunitas pecinta kuliner dan masak-memasak', 'icon' => '🍳', 'is_active' => true],
            ['name' => 'Traveling', 'slug' => 'traveling', 'description' => 'Komunitas traveler dan petualang', 'icon' => '✈️', 'is_active' => true],
            ['name' => 'Sosial & Komunitas Lokal', 'slug' => 'sosial-lokal', 'description' => 'Komunitas sosial dan kegiatan lokal', 'icon' => '🤝', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            CommunityCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
