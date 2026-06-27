<?php

namespace Database\Seeders\Master;

use App\Models\HomepageSection;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            ['key' => 'hero', 'title' => 'Temukan, Bangun, dan Kembangkan Komunitasmu', 'subtitle' => 'KomunaID menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem kolaborasi.', 'sort_order' => 1, 'is_active' => true],
            ['key' => 'value_proposition', 'title' => 'Kenapa KomunaID?', 'subtitle' => 'Platform komunitas Indonesia yang menghubungkan minat, bakat, dan passion Anda.', 'sort_order' => 2, 'is_active' => true],
            ['key' => 'how_it_works', 'title' => 'Cara Kerja KomunaID', 'subtitle' => 'Langkah sederhana untuk memulai.', 'sort_order' => 3, 'is_active' => true],
            ['key' => 'for_communities', 'title' => 'Untuk Komunitas', 'subtitle' => 'Bangun dan kelola komunitasmu.', 'sort_order' => 4, 'is_active' => true],
            ['key' => 'for_brands', 'title' => 'Untuk Brand & Perusahaan', 'subtitle' => 'Temukan komunitas target.', 'sort_order' => 5, 'is_active' => true],
            ['key' => 'suggestion_cta', 'title' => 'Punya Saran untuk KomunaID?', 'subtitle' => 'Kami terbuka untuk masukan.', 'sort_order' => 6, 'is_active' => true],
        ];

        foreach ($sections as $section) {
            HomepageSection::updateOrCreate(
                ['key' => $section['key']],
                array_merge($section, ['language_code' => 'id'])
            );
        }
    }
}
