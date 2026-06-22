<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\RoleRequest;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = User::role('member')->get();
        $communities = Community::where('status', 'approved')->get();

        // Add some members to communities
        if ($members->count() > 0 && $communities->count() > 0) {
            // Add first 5 members to first community
            $members->slice(0, 5)->each(function ($member) use ($communities) {
                CommunityMember::create([
                    'community_id' => $communities[0]->id,
                    'user_id' => $member->id,
                    'role' => 'member',
                    'status' => 'approved',
                    'joined_at' => now()->subDays(rand(1, 30)),
                ]);
            });

            // Add members 3-7 to second community
            $members->slice(2, 5)->each(function ($member) use ($communities) {
                if ($communities->has(1)) {
                    CommunityMember::create([
                        'community_id' => $communities[1]->id,
                        'user_id' => $member->id,
                        'role' => 'member',
                        'status' => 'approved',
                        'joined_at' => now()->subDays(rand(1, 30)),
                    ]);
                }
            });

            // Add pending member join request
            if ($members->has(8) && $communities->has(0)) {
                CommunityMember::create([
                    'community_id' => $communities[0]->id,
                    'user_id' => $members[8]->id,
                    'role' => 'member',
                    'status' => 'pending',
                ]);
            }
        }

        // Role requests
        if ($members->count() >= 2) {
            RoleRequest::create([
                'user_id' => $members[0]->id,
                'requested_role' => 'community_owner',
                'reason' => 'Saya ingin membuat komunitas fotografi di kota saya.',
                'status' => 'pending',
            ]);

            RoleRequest::create([
                'user_id' => $members[2]->id,
                'requested_role' => 'brand_owner',
                'reason' => 'Saya memiliki brand fashion dan ingin berkolaborasi dengan komunitas.',
                'status' => 'approved',
                'reviewed_by' => User::where('email', 'admin@komunaid.com')->first()->id,
                'reviewed_at' => now()->subDays(2),
            ]);
        }
    }
}
