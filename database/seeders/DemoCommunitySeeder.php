<?php

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunityCategory;
use App\Models\CommunityMember;
use App\Models\CommunityManagement;
use App\Models\CommunityVolunteer;
use App\Models\CommunityCampaign;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoCommunitySeeder extends Seeder
{
    public function run(): void
    {
        $categories = CommunityCategory::pluck('id', 'slug');
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();
        $member = User::where('email', 'member@komuna.test')->first();

        if (!$communityOwner) {
            $this->command->warn('DemoUserSeeder must run first. Skipping DemoCommunitySeeder.');
            return;
        }

        $communities = [
            [
                'name' => 'Jakarta Book Party',
                'slug' => Str::slug('Jakarta Book Party'),
                'category_id' => $categories['pendidikan'] ?? 1,
                'owner_id' => $communityOwner->id,
                'description' => 'Komunitas pecinta buku dan literasi di Jakarta. Rutin mengadakan book club, diskusi, dan sharing session.',
                'about' => 'Jakarta Book Party adalah komunitas literasi yang aktif di Jakarta. Kami percaya bahwa membaca adalah jendela dunia.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'status' => 'approved',
                'is_public' => true,
                'visibility' => 'public',
                'community_type' => 'open',
            ],
            [
                'name' => 'Komunitas Urban Runner',
                'slug' => Str::slug('Komunitas Urban Runner'),
                'category_id' => $categories['olahraga'] ?? 4,
                'owner_id' => $communityOwner->id,
                'description' => 'Komunitas pelari urban di Jakarta. Lari bareng setiap weekend di berbagai lokasi.',
                'about' => 'Urban Runner mengadakan lari rutin setiap Minggu pagi. Cocok untuk pemula maupun experienced runner.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'status' => 'approved',
                'is_public' => true,
                'visibility' => 'public',
                'community_type' => 'open',
            ],
            [
                'name' => 'Bandung Creative Circle',
                'slug' => Str::slug('Bandung Creative Circle'),
                'category_id' => $categories['desain-kreatif'] ?? 3,
                'owner_id' => $communityOwner->id,
                'description' => 'Komunitas kreatif Bandung. Desainer, ilustrator, fotografer, dan kreator lainnya.',
                'about' => 'Bandung Creative Circle menghubungkan para kreator di Bandung untuk berkolaborasi dan berbagi inspirasi.',
                'region' => 'Jawa Barat',
                'city' => 'Bandung',
                'status' => 'approved',
                'is_public' => true,
                'visibility' => 'public',
                'community_type' => 'open',
            ],
            [
                'name' => 'Komunitas Volunteer Sosial',
                'slug' => Str::slug('Komunitas Volunteer Sosial'),
                'category_id' => $categories['sosial-lokal'] ?? 10,
                'owner_id' => $communityOwner->id,
                'description' => 'Komunitas volunteer untuk kegiatan sosial dan kemanusiaan.',
                'about' => 'Kami mengkoordinasikan kegiatan volunteer untuk berbagai program sosial di Jakarta dan sekitarnya.',
                'region' => 'Banten',
                'city' => 'Tangerang',
                'status' => 'approved',
                'is_public' => true,
                'visibility' => 'public',
                'community_type' => 'open',
            ],
            [
                'name' => 'Komunitas Private Demo',
                'slug' => Str::slug('Komunitas Private Demo'),
                'category_id' => $categories['teknologi'] ?? 1,
                'owner_id' => $communityOwner->id,
                'description' => 'Komunitas private untuk testing visibility.',
                'about' => 'Komunitas ini hanya untuk testing fitur visibility private.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'status' => 'approved',
                'is_public' => false,
                'visibility' => 'private',
                'community_type' => 'closed',
            ],
        ];

        foreach ($communities as $data) {
            $community = Community::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            if ($member) {
                $existing = CommunityMember::where('community_id', $community->id)
                    ->where('user_id', $member->id)
                    ->first();

                if (!$existing && $community->visibility === 'public') {
                    CommunityMember::create([
                        'community_id' => $community->id,
                        'user_id' => $member->id,
                        'role' => 'member',
                        'status' => 'active',
                        'joined_at' => Carbon::now()->subDays(rand(5, 30)),
                    ]);
                }
            }

            $existingPengurus = CommunityManagement::where('community_id', $community->id)
                ->where('user_id', $communityOwner->id)
                ->first();

            if (!$existingPengurus) {
                CommunityManagement::create([
                    'community_id' => $community->id,
                    'user_id' => $communityOwner->id,
                    'position' => 'Ketua',
                    'status' => 'active',
                    'start_date' => Carbon::now()->subDays(60),
                    'created_by' => $communityOwner->id,
                ]);
            }

            if ($community->slug === Str::slug('Komunitas Volunteer Sosial')) {
                if ($member) {
                    $existingVolunteer = CommunityVolunteer::where('community_id', $community->id)
                        ->where('user_id', $member->id)
                        ->first();

                    if (!$existingVolunteer) {
                        CommunityVolunteer::create([
                            'community_id' => $community->id,
                            'user_id' => $member->id,
                            'position' => 'Event Volunteer',
                            'task_description' => 'Event organizing, First aid',
                            'status' => 'active',
                            'start_date' => Carbon::now()->subDays(20),
                            'created_by' => $communityOwner->id,
                        ]);
                    }
                }

                $existingCampaign = CommunityCampaign::where('community_id', $community->id)
                    ->where('title', 'Rekrutmen Volunteer Baru')
                    ->first();

                if (!$existingCampaign) {
                    CommunityCampaign::create([
                        'community_id' => $community->id,
                        'type' => 'volunteer',
                        'title' => 'Rekrutmen Volunteer Baru',
                        'slug' => Str::slug('Rekrutmen Volunteer Baru'),
                        'description' => 'Kami mencari volunteer baru untuk program sosial Q3 2026.',
                        'status' => 'active',
                        'quota' => 20,
                        'created_by' => $communityOwner->id,
                    ]);
                }
            }
        }
    }
}
