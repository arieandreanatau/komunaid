<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\MemberJoinHistory;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function join(Community $community)
    {
        $user = auth()->user();

        if (!$community->isApproved()) {
            return back()->with('error', 'Komunitas belum disetujui.');
        }

        $check = $user->canJoinCommunity($community);

        if (!$check['allowed']) {
            return back()->with('error', $check['reason']);
        }

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'action' => 'joined',
            'acted_at' => now(),
        ]);

        return back()->with('success', "Berhasil bergabung dengan {$community->name}!");
    }

    public function leave(Community $community)
    {
        $user = auth()->user();

        $membership = CommunityMember::where('community_id', $community->id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return back()->with('error', 'Anda bukan anggota komunitas ini.');
        }

        $membership->update(['status' => 'left']);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'action' => 'left',
            'acted_at' => now(),
        ]);

        $joinCount = $user->joinHistories()
            ->where('community_id', $community->id)
            ->whereIn('action', ['joined', 'left'])
            ->count();

        if ($joinCount >= 6) {
            $nextJoin = $user->joinHistories()
                ->where('community_id', $community->id)
                ->where('action', 'left')
                ->latest('acted_at')
                ->first();

            if ($nextJoin) {
                $disabledUntil = $nextJoin->acted_at->addMonth();
                return back()->with('warning', "Anda telah keluar masuk {$joinCount}x. Join akan disabled hingga {$disabledUntil->format('d M Y')}.");
            }
        }

        return back()->with('success', "Berhasil keluar dari {$community->name}.");
    }
}
