<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'key' => 'about',
                'slug' => 'tentang-kami',
                'title' => 'Tentang KomunaID',
                'content' => '<p>KomunaID adalah platform komunitas yang membantu masyarakat menemukan komunitas, mengelola kegiatan, dan membuka peluang kolaborasi antara komunitas, brand, dan perusahaan.</p>
<p>Kami percaya bahwa setiap orang berhak menemukan komunitas yang sesuai dengan minat dan passion mereka. Melalui KomunaID, kami ingin membangun ekosistem kolaborasi yang inklusif dan berdampak positif bagi masyarakat Indonesia.</p>
<h3>Visi</h3>
<p>Menjadi platform komunitas terdepan di Indonesia yang menghubungkan dan mengembangkan potensi komunitas lokal.</p>
<h3>Misi</h3>
<ul>
<li>Memudahkan masyarakat menemukan dan bergabung dengan komunitas</li>
<li>Menyediakan tools komunitas yang lengkap dan mudah digunakan</li>
<li>Membuka peluang kolaborasi antara komunitas, brand, dan perusahaan</li>
<li>Mendorong pertumbuhan komunitas Indonesia yang positif dan berkelanjutan</li>
</ul>',
                'meta_title' => 'Tentang KomunaID — Platform Komunitas Indonesia',
                'meta_description' => 'Kenali lebih dekat KomunaID, platform komunitas Indonesia yang menghubungkan member, komunitas, brand, dan perusahaan.',
                'status' => 'published',
                'is_published' => true,
                'language_code' => 'id',
            ],
        ];

        foreach ($pages as $page) {
            CmsPage::updateOrCreate(
                ['key' => $page['key']],
                $page
            );
        }
    }
}
