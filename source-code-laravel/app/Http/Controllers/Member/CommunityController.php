<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index()
    {
        $communities = auth()->user()->memberCommunities()
            ->withPivot('status', 'joined_at')
            ->get();

        return view('member.communities.index', compact('communities'));
    }

    public function join(Community $community)
    {
        $user = auth()->user();

        $existing = CommunityMember::where('community_id', $community->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'left') {
                $existing->update(['status' => 'pending', 'joined_at' => null]);
                return redirect()->back()->with('success', 'Berhasil join kembali. Menunggu approval.');
            }
            return redirect()->back()->with('error', 'Anda sudah terdaftar di komunitas ini.');
        }

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Berhasil mengajukan join. Menunggu approval dari admin komunitas.');
    }

    public function leave(Community $community)
    {
        $member = CommunityMember::where('community_id', $community->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($member) {
            $member->update(['status' => 'left']);
        }

        return redirect()->back()->with('success', 'Berhasil leave komunitas.');
    }
}
