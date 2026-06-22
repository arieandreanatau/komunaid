<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Community $community, Request $request)
    {
        $this->authorizeCommunity($community);

        $query = $community->members()->with('profile');

        if ($request->has('status') && $request->status) {
            $query->wherePivot('status', $request->status);
        }

        $members = $query->paginate(15);

        return view('community-owner.members.index', compact('community', 'members'));
    }

    public function approve(Community $community, CommunityMember $member)
    {
        $this->authorizeCommunity($community);

        $member->update([
            'status' => 'approved',
            'joined_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Anggota berhasil di-approve.');
    }

    public function reject(Community $community, CommunityMember $member)
    {
        $this->authorizeCommunity($community);

        $member->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Anggota berhasil ditolak.');
    }

    public function remove(Community $community, CommunityMember $member)
    {
        $this->authorizeCommunity($community);

        $member->update(['status' => 'left']);
        return redirect()->back()->with('success', 'Anggota berhasil dikeluarkan.');
    }

    private function authorizeCommunity(Community $community): void
    {
        if ($community->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
