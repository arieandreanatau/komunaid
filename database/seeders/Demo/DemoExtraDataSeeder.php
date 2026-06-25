<?php

namespace Database\Seeders\Demo;

use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\Company;
use App\Models\CompanyBrandMember;
use App\Models\Community;
use App\Models\CommunityCampaign;
use App\Models\CommunityCategory;
use App\Models\CommunityMember;
use App\Models\CommunityVolunteer;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventType;
use App\Models\Profile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DemoExtraDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureRoles();
        $members = $this->seedExtraMembers();
        $extraBrands = $this->seedExtraBrands();
        $extraCompanies = $this->seedExtraCompanies();
        $this->linkBrandsToCompanies($extraBrands, $extraCompanies);
        $this->seedExtraCommunities($members);
        $this->seedExtraEvents($members);
        $this->seedBrandMembers($extraBrands, $members);
        $this->printCredentials();
    }

    private function ensureRoles(): void
    {
        foreach (['superadmin', 'admin_platform', 'member', 'community_owner', 'community_pengurus', 'community_volunteer', 'brand_owner', 'company_owner', 'event_volunteer'] as $name) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }

    private function seedExtraMembers(): array
    {
        $memberRole = Role::where('name', 'member')->first();
        $communityPengurusRole = Role::where('name', 'community_pengurus')->first();
        $communityVolunteerRole = Role::where('name', 'community_volunteer')->first();
        $eventVolunteerRole = Role::where('name', 'event_volunteer')->first();

        $fakerNames = [
            ['Andi Pratama', 'andi.pratama', 'andi.pratama@komuna.test', 'Jakarta', 'DKI Jakarta'],
            ['Siti Nurhaliza', 'siti.nurhaliza', 'siti.nurhaliza@komuna.test', 'Bandung', 'Jawa Barat'],
            ['Budi Santoso', 'budi.santoso', 'budi.santoso@komuna.test', 'Surabaya', 'Jawa Timur'],
            ['Dewi Lestari', 'dewi.lestari', 'dewi.lestari@komuna.test', 'Yogyakarta', 'DI Yogyakarta'],
            ['Rudi Hartono', 'rudi.hartono', 'rudi.hartono@komuna.test', 'Semarang', 'Jawa Tengah'],
            ['Maya Sari', 'maya.sari', 'maya.sari@komuna.test', 'Denpasar', 'Bali'],
            ['Fajar Nugroho', 'fajar.nugroho', 'fajar.nugroho@komuna.test', 'Medan', 'Sumatera Utara'],
            ['Indah Permata', 'indah.permata', 'indah.permata@komuna.test', 'Makassar', 'Sulawesi Selatan'],
            ['Agus Wijaya', 'agus.wijaya', 'agus.wijaya@komuna.test', 'Palembang', 'Sumatera Selatan'],
            ['Lina Marlina', 'lina.marlina', 'lina.marlina@komuna.test', 'Balikpapan', 'Kalimantan Timur'],
            ['Hendra Kurniawan', 'hendra.kurniawan', 'hendra.kurniawan@komuna.test', 'Manado', 'Sulawesi Utara'],
            ['Putri Ayu', 'putri.ayu', 'putri.ayu@komuna.test', 'Pontianak', 'Kalimantan Barat'],
            ['Rizky Ramadhan', 'rizky.ramadhan', 'rizky.ramadhan@komuna.test', 'Banjarmasin', 'Kalimantan Selatan'],
            ['Nadia Putri', 'nadia.putri', 'nadia.putri@komuna.test', 'Padang', 'Sumatera Barat'],
            ['Yoga Pratama', 'yoga.pratama', 'yoga.pratama@komuna.test', 'Malang', 'Jawa Timur'],
            ['Citra Kirana', 'citra.kirana', 'citra.kirana@komuna.test', 'Solo', 'Jawa Tengah'],
            ['Dimas Anggara', 'dimas.anggara', 'dimas.anggara@komuna.test', 'Bogor', 'Jawa Barat'],
            ['Tari Salsabila', 'tari.salsabila', 'tari.salsabila@komuna.test', 'Tangerang', 'Banten'],
            ['Bayu Pamungkas', 'bayu.pamungkas', 'bayu.pamungkas@komuna.test', 'Bekasi', 'Jawa Barat'],
            ['Anissa Rahma', 'anissa.rahma', 'anissa.rahma@komuna.test', 'Depok', 'Jawa Barat'],
            ['Reza Rahadian', 'reza.rahadian', 'reza.rahadian@komuna.test', 'Cirebon', 'Jawa Barat'],
            ['Mutiara Anjani', 'mutiara.anjani', 'mutiara.anjani@komuna.test', 'Jogja', 'DI Yogyakarta'],
            ['Iqbal Ramadhan', 'iqbal.ramadhan', 'iqbal.ramadhan@komuna.test', 'Pekanbaru', 'Riau'],
            ['Sasha Iskandar', 'sasha.iskandar', 'sasha.iskandar@komuna.test', 'Bandar Lampung', 'Lampung'],
        ];

        $created = [];
        $i = 0;
        foreach ($fakerNames as [$name, $username, $email, $city, $province]) {
            $i++;
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'username' => $username,
                    'password' => Hash::make('password'),
                    'email_verified_at' => Carbon::now()->subDays(rand(1, 60)),
                    'status' => 'active',
                    'phone' => '+6281' . str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                    'last_login_at' => Carbon::now()->subDays(rand(0, 7)),
                    'last_login_ip' => '127.0.0.' . rand(2, 254),
                ]
            );

            Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'username' => $username,
                    'display_name' => $name,
                    'bio' => 'Pengguna aktif KomunaID yang tertarik dengan komunitas, event, dan kolaborasi.',
                    'city' => $city,
                    'province' => $province,
                    'country' => 'Indonesia',
                    'gender' => $i % 2 === 0 ? 'female' : 'male',
                    'date_of_birth' => Carbon::now()->subYears(rand(20, 40))->subDays(rand(0, 365)),
                    'privacy' => 'public',
                    'skills' => ['Komunikasi', 'Organisasi', 'Desain Grafis', 'Public Speaking'],
                    'social_links' => [
                        'instagram' => '@' . $username,
                    ],
                ]
            );

            if (!$user->hasRole('member') && $memberRole) {
                $user->assignRole('member');
            }

            if ($i % 4 === 0 && $communityPengurusRole && !$user->hasRole('community_pengurus')) {
                $user->assignRole('community_pengurus');
            }
            if ($i % 5 === 0 && $communityVolunteerRole && !$user->hasRole('community_volunteer')) {
                $user->assignRole('community_volunteer');
            }
            if ($i % 6 === 0 && $eventVolunteerRole && !$user->hasRole('event_volunteer')) {
                $user->assignRole('event_volunteer');
            }

            $created[] = $user;
        }

        $this->command->info('Extra members seeded: ' . count($created));
        return $created;
    }

    private function seedExtraBrands(): array
    {
        $brandOwner = User::where('email', 'brand.owner@komuna.test')->first();
        if (!$brandOwner) {
            return [];
        }

        $brands = [
            ['Tani Lokal', 'Agriculture', 'Brand produk pertanian lokal Indonesia.'],
            ['EcoPack ID', 'Packaging', 'Solusi kemasan ramah lingkungan untuk UMKM.'],
            ['Batik Modern', 'Fashion', 'Brand fashion batik dengan desain modern.'],
            ['Tentor.id', 'Education', 'Platform bimbingan belajar online untuk siswa Indonesia.'],
            ['Waroeng Sehat', 'F&B', 'Restoran sehat dengan menu lokal.'],
            ['Hijab Cantik', 'Fashion', 'Brand hijab dan fashion muslimah.'],
        ];

        $created = [];
        foreach ($brands as [$name, $industry, $desc]) {
            $brand = Brand::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'owner_id' => $brandOwner->id,
                    'name' => $name,
                    'description' => $desc,
                    'industry' => $industry,
                    'email' => Str::slug($name) . '@brand.test',
                    'website_url' => 'https://' . Str::slug($name) . '.test',
                    'instagram_url' => '@' . Str::slug($name),
                    'status' => 'approved',
                    'is_featured' => rand(0, 1) === 1,
                    'created_by' => $brandOwner->id,
                ]
            );
            $created[] = $brand;
        }

        $this->command->info('Extra brands seeded: ' . count($created));
        return $created;
    }

    private function seedExtraCompanies(): array
    {
        $companyOwner = User::where('email', 'company.owner@komuna.test')->first();
        if (!$companyOwner) {
            return [];
        }

        $companies = [
            ['CV Maju Bersama', 'Distribution', 'Perusahaan distribusi barang konsumsi.'],
            ['PT Digital Kreasi Nusantara', 'Technology', 'Perusahaan teknologi yang fokus pada solusi digital untuk UMKM.'],
            ['PT Hijau Lestari', 'Agriculture', 'Perusahaan agribisnis berkelanjutan.'],
        ];

        $created = [];
        foreach ($companies as [$name, $industry, $desc]) {
            $company = Company::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'owner_id' => $companyOwner->id,
                    'name' => $name,
                    'legal_name' => $name,
                    'industry' => $industry,
                    'description' => $desc,
                    'email' => 'info@' . Str::slug($name) . '.test',
                    'phone' => '+6221' . rand(1000000, 9999999),
                    'city' => 'Jakarta',
                    'province' => 'DKI Jakarta',
                    'status' => 'approved',
                    'created_by' => $companyOwner->id,
                ]
            );
            $created[] = $company;
        }

        $this->command->info('Extra companies seeded: ' . count($created));
        return $created;
    }

    private function linkBrandsToCompanies(array $brands, array $companies): void
    {
        if (empty($brands) || empty($companies)) {
            return;
        }
        $companyOwner = User::where('email', 'company.owner@komuna.test')->first();
        if (!$companyOwner) {
            return;
        }

        $pairs = [
            [0, 0],
            [1, 1],
            [2, 0],
            [3, 1],
        ];

        foreach ($pairs as [$bi, $ci]) {
            if (!isset($brands[$bi], $companies[$ci])) {
                continue;
            }
            CompanyBrandMember::updateOrCreate(
                [
                    'company_id' => $companies[$ci]->id,
                    'brand_id' => $brands[$bi]->id,
                ],
                [
                    'user_id' => $companyOwner->id,
                    'role' => 'subsidiary',
                    'status' => 'active',
                ]
            );
        }
    }

    private function seedExtraCommunities(array $members): void
    {
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();
        if (!$communityOwner || empty($members)) {
            return;
        }
        $categories = CommunityCategory::pluck('id', 'slug');

        $communities = [
            ['Surabaya Coding Club', 'teknologi', 'Jawa Timur', 'Surabaya', 'Komunitas programmer dan developer di Surabaya.'],
            ['Yogyakarta Photography Society', 'desain-kreatif', 'DI Yogyakarta', 'Yogyakarta', 'Komunitas fotografi untuk semua level di Yogyakarta.'],
            ['Medan Food Hunter', 'kuliner', 'Sumatera Utara', 'Medan', 'Pecinta kuliner yang mengeksplorasi makanan khas Medan.'],
            ['Bali Yoga Community', 'kesehatan', 'Bali', 'Denpasar', 'Komunitas yoga dan mindfulness di Bali.'],
            ['Jakarta Startup Network', 'teknologi', 'DKI Jakarta', 'Jakarta', 'Jaringan founder, investor, dan enabler startup di Jakarta.'],
        ];

        $created = [];
        foreach ($communities as [$name, $catSlug, $province, $city, $desc]) {
            $slug = Str::slug($name);
            $community = Community::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'category_id' => $categories[$catSlug] ?? 1,
                    'owner_id' => $communityOwner->id,
                    'description' => $desc,
                    'about' => $desc . ' Kami rutin mengadakan gathering, workshop, dan event kolaboratif.',
                    'region' => $province,
                    'city' => $city,
                    'status' => 'approved',
                    'is_public' => true,
                    'visibility' => 'public',
                    'community_type' => 'open',
                ]
            );
            $created[] = $community;

            foreach (array_slice($members, 0, 8) as $i => $member) {
                if ($i % 2 === 0) {
                    CommunityMember::firstOrCreate(
                        ['community_id' => $community->id, 'user_id' => $member->id],
                        [
                            'role' => 'member',
                            'status' => 'active',
                            'joined_at' => Carbon::now()->subDays(rand(5, 60)),
                        ]
                    );
                }
            }
        }

        $this->command->info('Extra communities seeded: ' . count($created));
    }

    private function seedExtraEvents(array $members): void
    {
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();
        if (!$communityOwner || empty($members)) {
            return;
        }

        $communities = Community::where('owner_id', $communityOwner->id)->get();
        if ($communities->isEmpty()) {
            return;
        }

        $gatheringType = EventType::where('slug', 'gathering')->first();
        $workshopType = EventType::where('slug', 'workshop')->first();
        $volunteerType = EventType::where('slug', 'volunteer')->first();

        $events = [
            ['Surabaya Tech Meetup', $communities->firstWhere('slug', 'surabaya-coding-club')?->id, $gatheringType?->id, 'free', 7, 40, 'Surabaya', 'Jawa Timur'],
            ['Workshop Pemotretan Produk', $communities->firstWhere('slug', 'yogyakarta-photography-society')?->id, $workshopType?->id, 'paid', 14, 25, 'Yogyakarta', 'DI Yogyakarta'],
            ['Medan Kuliner Festival', $communities->firstWhere('slug', 'medan-food-hunter')?->id, $gatheringType?->id, 'paid', 21, 200, 'Medan', 'Sumatera Utara'],
            ['Sunset Yoga Session', $communities->firstWhere('slug', 'bali-yoga-community')?->id, $workshopType?->id, 'free', 10, 30, 'Denpasar', 'Bali'],
            ['Volunteer Bersih Pantai Kuta', $communities->firstWhere('slug', 'bali-yoga-community')?->id, $volunteerType?->id, 'free', 18, 50, 'Denpasar', 'Bali'],
            ['Startup Pitch Night', $communities->firstWhere('slug', 'jakarta-startup-network')?->id, $gatheringType?->id, 'free', 12, 80, 'Jakarta', 'DKI Jakarta'],
        ];

        $created = [];
        foreach ($events as [$title, $communityId, $typeId, $eventType, $daysAhead, $capacity, $city, $province]) {
            if (!$communityId) {
                continue;
            }
            $slug = Str::slug($title);
            $event = Event::updateOrCreate(
                ['slug' => $slug],
                [
                    'community_id' => $communityId,
                    'created_by' => $communityOwner->id,
                    'title' => $title,
                    'description' => "Event demo untuk pengujian platform KomunaID: {$title}.",
                    'short_description' => substr("{$title} demo event", 0, 200),
                    'type_id' => $typeId,
                    'event_type' => $eventType,
                    'location_type' => 'offline',
                    'location_name' => 'Venue Demo ' . $city,
                    'location_address' => 'Jl. Demo No. ' . rand(1, 200) . ', ' . $city,
                    'city' => $city,
                    'province' => $province,
                    'start_datetime' => Carbon::now()->addDays($daysAhead)->setTime(rand(9, 18), 0),
                    'end_datetime' => Carbon::now()->addDays($daysAhead)->setTime(rand(19, 21), 0),
                    'capacity' => $capacity,
                    'price' => $eventType === 'paid' ? 25000 : 0,
                    'registration_status' => 'open',
                    'registration_type' => 'free',
                    'approval_status' => 'approved',
                    'status' => 'published',
                    'visibility' => 'public',
                    'is_open_volunteer' => $eventType === 'volunteer',
                    'is_open_donation' => $eventType === 'volunteer',
                    'is_charity' => $eventType === 'volunteer',
                ]
            );
            $created[] = $event;

            foreach (array_slice($members, 0, 6) as $i => $member) {
                EventRegistration::firstOrCreate(
                    ['event_id' => $event->id, 'user_id' => $member->id],
                    [
                        'status' => 'registered',
                        'payment_status' => $event->price > 0 ? 'paid' : null,
                        'registered_at' => Carbon::now()->subDays(rand(1, 10)),
                    ]
                );

                if ($event->is_open_volunteer && $i % 2 === 0) {
                    CommunityVolunteer::firstOrCreate(
                        ['community_id' => $event->community_id, 'user_id' => $member->id, 'position' => 'Event Volunteer ' . $event->title],
                        [
                            'task_description' => 'Membantu jalannya acara ' . $event->title,
                            'status' => 'active',
                            'start_date' => Carbon::now()->subDays(rand(1, 5)),
                            'created_by' => $communityOwner->id,
                        ]
                    );
                }
            }
        }

        $this->command->info('Extra events seeded: ' . count($created));
    }

    private function seedBrandMembers(array $brands, array $members): void
    {
        if (empty($brands) || empty($members)) {
            return;
        }
        $brandOwner = User::where('email', 'brand.owner@komuna.test')->first();
        if (!$brandOwner) {
            return;
        }
        $count = 0;
        foreach ($brands as $i => $brand) {
            $assignees = array_slice($members, $i * 2, 2);
            foreach ($assignees as $member) {
                BrandMember::firstOrCreate(
                    ['brand_id' => $brand->id, 'user_id' => $member->id],
                    [
                        'role' => 'staff',
                        'status' => 'active',
                        'joined_at' => Carbon::now()->subDays(rand(10, 90)),
                    ]
                );
                $count++;
            }
        }
        $this->command->info('Brand members added: ' . $count);
    }

    private function printCredentials(): void
    {
        $this->command->info('');
        $this->command->info('=== Demo Login Credentials (password: password) ===');
        $this->command->info('  superadmin@komuna.id / superadmin@komuna.test');
        $this->command->info('  admin@komuna.test (admin_platform)');
        $this->command->info('  member@komuna.test (member)');
        $this->command->info('  community.owner@komuna.test (community_owner)');
        $this->command->info('  brand.owner@komuna.test (brand_owner)');
        $this->command->info('  company.owner@komuna.test (company_owner)');
        $this->command->info('  Extra members: andi.pratama@komuna.test .. sasha.iskandar@komuna.test (24 users)');
        $this->command->info('==================================================');
    }
}
