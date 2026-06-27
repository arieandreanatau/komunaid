<?php

namespace Database\Seeders\Master;

use App\Models\Community;
use App\Models\CommunityCategory;
use App\Models\CommunityMember;
use App\Models\CommunityMemberRole;
use App\Models\CommunityRegion;
use App\Models\CommunitySubgroup;
use App\Models\MemberJoinHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CommunityOwnerSeeder extends Seeder
{
    public function run(): void
    {
        $categories = CommunityCategory::pluck('id', 'slug');

        // Create second community owner
        $owner2 = User::updateOrCreate(
            ['email' => 'owner2@komuna.id'],
            ['name' => 'Rina Community Owner', 'password' => bcrypt('password')]
        );
        $owner2->profile()->updateOrCreate(
            ['user_id' => $owner2->id],
            ['username' => 'rina_owner', 'bio' => 'Pemilik komunitas gaming di KomunaID', 'city' => 'Jakarta', 'province' => 'DKI Jakarta']
        );
        if (!$owner2->hasRole('community_owner')) {
            $owner2->assignRole('community_owner');
        }

        $communityOwner = User::where('email', 'community@komuna.id')->first();

        // Create pending community
        $pendingCommunity = Community::updateOrCreate(
            ['slug' => Str::slug('Koding Bareng')],
            [
                'category_id' => $categories['teknologi'] ?? 1,
                'owner_id' => $communityOwner->id,
                'name' => 'Koding Bareng',
                'description' => 'Komunitas belajar coding untuk pemula. Nge-koding bareng, saling membantu.',
                'about' => 'Koding Bareng adalah komunitas untuk siapa saja yang ingin belajar coding dari nol. Kami menyediakan mentorship gratis.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'contact_email' => 'koding@komuna.id',
                'instagram' => '@koding_bareng',
                'community_type' => 'open',
                'visibility' => 'public',
                'status' => 'pending',
                'is_public' => true,
            ]
        );

        // Create community with region
        $gamingCommunity = Community::updateOrCreate(
            ['slug' => Str::slug('Gaming Indonesia')],
            [
                'category_id' => $categories['olahraga'] ?? 4,
                'owner_id' => $owner2->id,
                'name' => 'Gaming Indonesia',
                'description' => 'Komunitas gamer Indonesia. Turnamen, tournament, dan fun gaming.',
                'about' => 'Gaming Indonesia mengadakan turnamen mingguan dan gathering bulanan untuk para gamer di seluruh Indonesia.',
                'region' => 'Nasional',
                'city' => 'Online',
                'contact_email' => 'gaming@komuna.id',
                'instagram' => '@gaming_indonesia',
                'social_media' => 'Discord: gaming.id',
                'community_type' => 'closed',
                'visibility' => 'public',
                'status' => 'approved',
                'is_public' => true,
            ]
        );

        // Create regions for Gaming Indonesia
        $regionJakarta = CommunityRegion::updateOrCreate(
            ['community_id' => $gamingCommunity->id, 'slug' => Str::slug('Jakarta Raya')],
            [
                'owner_id' => $owner2->id,
                'name' => 'Jakarta Raya',
                'description' => 'Regional gaming untuk area Jakarta dan sekitarnya.',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'status' => 'active',
            ]
        );

        $regionBandung = CommunityRegion::updateOrCreate(
            ['community_id' => $gamingCommunity->id, 'slug' => Str::slug('Bandung')],
            [
                'owner_id' => $owner2->id,
                'name' => 'Bandung',
                'description' => 'Regional gaming untuk area Bandung.',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'status' => 'active',
            ]
        );

        // Create subgroups for Gaming Indonesia
        $esportSubgroup = CommunitySubgroup::updateOrCreate(
            ['community_id' => $gamingCommunity->id, 'slug' => Str::slug('E-Sport')],
            [
                'owner_id' => $owner2->id,
                'name' => 'E-Sport',
                'description' => 'Divisi kompetitif gaming.',
                'status' => 'active',
            ]
        );

        $casualSubgroup = CommunitySubgroup::updateOrCreate(
            ['community_id' => $gamingCommunity->id, 'slug' => Str::slug('Casual Gaming')],
            [
                'owner_id' => $owner2->id,
                'name' => 'Casual Gaming',
                'description' => 'Gaming santai dan fun.',
                'status' => 'active',
            ]
        );

        // Create members for gaming community
        $member = User::where('email', 'member@komuna.id')->first();
        $superadmin = User::where('email', 'superadmin@komuna.id')->first();

        // Member joins gaming community (idempotent)
        CommunityMember::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $member->id,
            ],
            [
                'role' => 'volunteer',
                'status' => 'active',
                'joined_at' => Carbon::now()->subDays(30),
            ]
        );

        CommunityMemberRole::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $member->id,
                'role' => 'volunteer',
            ],
            [
                'assigned_by' => $owner2->id,
                'assigned_at' => Carbon::now()->subDays(20),
            ]
        );

        MemberJoinHistory::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $member->id,
                'action' => 'joined',
            ],
            [
                'acted_at' => Carbon::now()->subDays(30),
            ]
        );

        // Superadmin joins gaming community as admin (idempotent)
        CommunityMember::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $superadmin->id,
            ],
            [
                'role' => 'admin',
                'status' => 'active',
                'joined_at' => Carbon::now()->subDays(45),
            ]
        );

        CommunityMemberRole::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $superadmin->id,
                'role' => 'admin',
            ],
            [
                'assigned_by' => $owner2->id,
                'assigned_at' => Carbon::now()->subDays(40),
            ]
        );

        MemberJoinHistory::firstOrCreate(
            [
                'community_id' => $gamingCommunity->id,
                'user_id' => $superadmin->id,
                'action' => 'joined',
            ],
            [
                'acted_at' => Carbon::now()->subDays(45),
            ]
        );

        // Create rejected community
        Community::updateOrCreate(
            ['slug' => Str::slug('Komunitas Tutup')],
            [
                'category_id' => $categories['sosial-komunitas-lokal'] ?? 10,
                'owner_id' => $owner2->id,
                'name' => 'Komunitas Tutup',
                'description' => 'Komunitas yang sudah ditutup.',
                'region' => 'Jawa Tengah',
                'city' => 'Semarang',
                'community_type' => 'closed',
                'visibility' => 'private',
                'status' => 'rejected',
                'is_public' => false,
            ]
        );
    }
}
