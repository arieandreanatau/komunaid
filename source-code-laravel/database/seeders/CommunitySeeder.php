<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $co1 = User::where('email', 'budi@komunaid.com')->first();
        $co2 = User::where('email', 'rina@komunaid.com')->first();

        // Communities
        $c1 = Community::create([
            'owner_id' => $co1->id,
            'name' => 'Komunitas Developer Indonesia',
            'slug' => 'komunitas-developer-indonesia',
            'description' => 'Komunitas para developer Indonesia untuk berbagi ilmu dan pengalaman dalam dunia pemrograman.',
            'category' => 'technology',
            'location' => 'Jakarta',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $c2 = Community::create([
            'owner_id' => $co1->id,
            'name' => 'Komunitas Startup Indonesia',
            'slug' => 'komunitas-startup-indonesia',
            'description' => 'Wadah para startup founder dan calon entrepreneur Indonesia.',
            'category' => 'business',
            'location' => 'Bandung',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $c3 = Community::create([
            'owner_id' => $co2->id,
            'name' => 'Komunitas Musisi Nusantara',
            'slug' => 'komunitas-musisi-nusantara',
            'description' => 'Komunitas musisi Indonesia dari berbagai genre untuk berkolaborasi dan berkarya.',
            'category' => 'music',
            'location' => 'Yogyakarta',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $c4 = Community::create([
            'owner_id' => $co2->id,
            'name' => 'Komunitas Fotografer Indonesia',
            'slug' => 'komunitas-fotografer-indonesia',
            'description' => 'Komunitas pecinta fotografi Indonesia.',
            'category' => 'art',
            'location' => 'Surabaya',
            'status' => 'pending',
            'is_public' => true,
        ]);

        // Brands
        Brand::create([
            'owner_id' => User::where('email', 'ahmad@komunaid.com')->first()->id,
            'name' => 'TechCorp Indonesia',
            'slug' => 'techcorp-indonesia',
            'description' => 'Perusahaan teknologi terkemuka di Indonesia.',
            'industry' => 'technology',
            'status' => 'approved',
        ]);

        Brand::create([
            'owner_id' => User::where('email', 'sari@komunaid.com')->first()->id,
            'name' => 'Foodies Bandung',
            'slug' => 'foodies-bandung',
            'description' => 'Platform kuliner terbesar di Bandung.',
            'industry' => 'food',
            'status' => 'approved',
        ]);

        Brand::create([
            'owner_id' => User::where('email', 'ahmad@komunaid.com')->first()->id,
            'name' => 'FashionHub Jakarta',
            'slug' => 'fashionhub-jakarta',
            'description' => 'Brand fashion lokal premium.',
            'industry' => 'fashion',
            'status' => 'pending',
        ]);

        // Events
        Event::create([
            'community_id' => $c1->id,
            'created_by' => $co1->id,
            'title' => 'Meetup Developer Jakarta',
            'slug' => 'meetup-developer-jakarta',
            'description' => 'Meetup bulanan komunitas developer Jakarta. Topik: Laravel Best Practices.',
            'location' => 'Jakarta Convention Center',
            'start_date' => now()->addDays(14),
            'end_date' => now()->addDays(14)->addHours(4),
            'max_participants' => 100,
            'status' => 'approved',
        ]);

        Event::create([
            'community_id' => $c3->id,
            'created_by' => $co2->id,
            'title' => 'Konser Amal Musik Nusantara',
            'slug' => 'konser-amal-musik-nusantara',
            'description' => 'Konser amal untuk menggalang dana pendidikan.',
            'location' => 'Taman Budaya Yogyakarta',
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(30)->addHours(5),
            'ticket_price' => 50000,
            'max_participants' => 200,
            'status' => 'pending',
        ]);

        Event::create([
            'community_id' => $c1->id,
            'created_by' => $co1->id,
            'title' => 'Workshop React.js untuk Pemula',
            'slug' => 'workshop-reactjs-pemula',
            'description' => 'Workshop intensif React.js selama 2 hari.',
            'location' => 'Online (Zoom)',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(8),
            'max_participants' => 50,
            'status' => 'approved',
            'is_online' => true,
        ]);
    }
}
