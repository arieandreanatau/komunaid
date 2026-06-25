<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\CmsPage;
use App\Models\HomepageSection;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoCmsContentSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::where('email', 'superadmin@komuna.id')->first()
            ?? User::where('email', 'superadmin@komuna.test')->first();

        $heroId = HomepageSection::updateOrCreate(
            ['key' => 'hero', 'language_code' => 'id'],
            [
                'title' => 'Temukan, Bangun, dan Kembangkan Komunitasmu',
                'subtitle' => 'KomunaID menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem kolaborasi.',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        HomepageSection::updateOrCreate(
            ['key' => 'hero', 'language_code' => 'en'],
            [
                'title' => 'Find, Build, and Grow Your Community',
                'subtitle' => 'KomunaID connects members, communities, brands, and companies in one collaborative ecosystem.',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        HomepageSection::updateOrCreate(
            ['key' => 'value_proposition', 'language_code' => 'id'],
            [
                'title' => 'Kenapa KomunaID?',
                'subtitle' => 'Platform komunitas Indonesia yang menghubungkan minat, bakat, dan passion Anda.',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        HomepageSection::updateOrCreate(
            ['key' => 'how_it_works', 'language_code' => 'id'],
            [
                'title' => 'Cara Kerja KomunaID',
                'subtitle' => 'Langkah sederhana untuk memulai.',
                'sort_order' => 3,
                'is_active' => true,
            ]
        );

        HomepageSection::updateOrCreate(
            ['key' => 'featured_communities', 'language_code' => 'id'],
            [
                'title' => 'Komunitas Unggulan',
                'subtitle' => 'Temukan komunitas yang sesuai dengan minatmu.',
                'sort_order' => 4,
                'is_active' => true,
            ]
        );

        HomepageSection::updateOrCreate(
            ['key' => 'latest_events_cta', 'language_code' => 'id'],
            [
                'title' => 'Event Terbaru',
                'subtitle' => 'Jangan lewatkan event menarik dari komunitas favoritmu.',
                'sort_order' => 5,
                'is_active' => true,
            ]
        );

        CmsPage::updateOrCreate(
            ['key' => 'about'],
            [
                'slug' => 'tentang-kami',
                'title' => 'Tentang KomunaID',
                'content' => '<p>KomunaID adalah platform komunitas yang membantu masyarakat menemukan komunitas, mengelola kegiatan, dan membuka peluang kolaborasi antara komunitas, brand, dan perusahaan.</p><p>Kami percaya bahwa setiap orang berhak menemukan komunitas yang sesuai dengan minat dan passion mereka.</p>',
                'status' => 'published',
                'is_published' => true,
                'language_code' => 'id',
                'meta_title' => 'Tentang KomunaID - Platform Komunitas Indonesia',
                'meta_description' => 'Kenali lebih dekat KomunaID, platform komunitas Indonesia.',
            ]
        );

        CmsPage::updateOrCreate(
            ['key' => 'contact'],
            [
                'slug' => 'hubungi-kami',
                'title' => 'Hubungi Kami',
                'content' => '<p>Hubungi kami untuk pertanyaan, saran, atau kerjasama.</p>',
                'status' => 'published',
                'is_published' => true,
                'language_code' => 'id',
                'meta_title' => 'Hubungi Kami - KomunaID',
                'meta_description' => 'Hubungi tim KomunaID untuk pertanyaan dan kerjasama.',
            ]
        );

        $blogs = [
            [
                'title' => 'Mengenal KomunaID',
                'slug' => 'mengenal-komunaid',
                'excerpt' => 'Apa itu KomunaID? Kenali lebih dekat platform komunitas Indonesia.',
                'content' => '<p>KomunaID adalah platform digital yang menghubungkan komunitas, brand, dan member dalam satu ekosistem kolaborasi. Dengan KomunaID, Anda bisa menemukan komunitas yang sesuai minat, mengelola event, dan membuka peluang kolaborasi.</p><p>Platform ini dirancang untuk memudahkan pertumbuhan komunitas di Indonesia.</p>',
                'category' => 'Platform',
                'tags' => ['komunaid', 'platform', 'komunitas'],
                'status' => 'published',
                'language_code' => 'id',
                'author_id' => $superadmin?->id,
            ],
            [
                'title' => 'Cara Komunitas Bertumbuh',
                'slug' => 'cara-komunitas-bertumbuh',
                'excerpt' => 'Tips dan strategi untuk mengembangkan komunitas Anda di era digital.',
                'content' => '<p> Komunitas yang sukses dimulai dari visi yang jelas dan anggota yang aktif. Berikut tips untuk mengembangkan komunitas Anda:</p><ul><li>Tentukan niche yang jelas</li><li>Bangun rutinitas kegiatan</li><li>Manfaatkan platform digital seperti KomunaID</li><li>Buka peluang kolaborasi dengan brand</li></ul>',
                'category' => 'Tips',
                'tags' => ['komunitas', 'tips', 'pertumbuhan'],
                'status' => 'published',
                'language_code' => 'id',
                'author_id' => $superadmin?->id,
            ],
            [
                'title' => 'Kolaborasi Brand dan Komunitas',
                'slug' => 'kolaborasi-brand-dan-komunitas',
                'excerpt' => 'Bagaimana brand dan komunitas bisa saling menguntungkan melalui kolaborasi.',
                'content' => '<p>Kolaborasi antara brand dan komunitas adalah win-win solution. Brand mendapatkan exposure ke target audience yang relevan, sementara komunitas mendapatkan dukungan finansial maupun non-finansial.</p><p>Melalui KomunaID, proses kolaborasi menjadi lebih mudah dan transparan.</p>',
                'category' => 'Kolaborasi',
                'tags' => ['brand', 'kolaborasi', 'komunitas'],
                'status' => 'published',
                'language_code' => 'id',
                'author_id' => $superadmin?->id,
            ],
            [
                'title' => 'Panduan Ikut Event Komunitas',
                'slug' => 'panduan-ikut-event-komunitas',
                'excerpt' => 'Panduan lengkap untuk mendaftar dan mengikuti event komunitas di KomunaID.',
                'content' => '<p>Mengikuti event komunitas di KomunaID sangat mudah. Berikut langkah-langkahnya:</p><ol><li>Browse event yang tersedia</li><li>Klik "Daftar" pada event yang diminati</li><li>Isi data diri jika diperlukan</li><li>Konfirmasi kehadiran Anda</li><li>Hadiri event sesuai jadwal</li></ol>',
                'category' => 'Panduan',
                'tags' => ['event', 'panduan', 'komunitas'],
                'status' => 'published',
                'language_code' => 'id',
                'author_id' => $superadmin?->id,
            ],
            [
                'title' => 'Draft Blog Post',
                'slug' => 'draft-blog-post',
                'excerpt' => 'Ini adalah blog post draft untuk testing visibility.',
                'content' => '<p>Blog post ini dalam status draft dan tidak akan tampil di halaman public.</p>',
                'category' => 'Draft',
                'tags' => ['draft'],
                'status' => 'draft',
                'language_code' => 'id',
                'author_id' => $superadmin?->id,
            ],
        ];

        foreach ($blogs as $data) {
            Blog::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
