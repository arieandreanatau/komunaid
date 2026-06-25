<?php

namespace Database\Seeders;

use App\Models\CollaborationType;
use Illuminate\Database\Seeder;

class CollaborationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Sponsorship', 'slug' => 'sponsorship', 'description' => 'Sponsorship event atau komunitas'],
            ['name' => 'Media Partner', 'slug' => 'media-partner', 'description' => 'Kerjasama media dan publikasi'],
            ['name' => 'Event Partner', 'slug' => 'event-partner', 'description' => 'Partner penyelenggaraan event'],
            ['name' => 'Product Support', 'slug' => 'product-support', 'description' => 'Dukungan produk untuk event'],
            ['name' => 'Community Activation', 'slug' => 'community-activation', 'description' => 'Aktivasi komunitas oleh brand'],
            ['name' => 'Donation', 'slug' => 'donation', 'description' => 'Donasi dari brand/perusahaan'],
            ['name' => 'Campaign', 'slug' => 'campaign', 'description' => 'Kampanye bersama'],
        ];

        foreach ($types as $type) {
            CollaborationType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}
