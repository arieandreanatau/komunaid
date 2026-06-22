<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\UpdateMemberRoleRequest;
use App\Http\Requests\CommunityOwner\BanMemberRequest;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\CommunityMemberRole;
use App\Models\CommunityBan;
use App\Models\MemberJoinHistory;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Community $community, Request $request)
    {
        $this->authorize('manageMembers', $community);

        $query = $community->members()->with('user.profile');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $members = $query->latest('joined_at')->paginate(20);

        $stats = [
            'total_active' => $community->activeMembers()->count(),
            'total_banned' => $community->bannedMembers()->count(),
            'total_pending' => $community->members()->where('status', 'pending')->count(),
        ];

        return view('community.members.index', compact('community', 'members', 'stats'));
    }

    public function approveMember(Community $community, CommunityMember $member)
    {
        $this->authorize('manageMembers', $community);

        if ($member->community_id !== $community->id) {
            return back()->with('error', 'Member tidak valid.');
        }

        if ($member->status !== 'pending') {
            return back()->with('error', 'Member tidak dalam status pending.');
        }

        $member->update([
            'status' => 'active',
            'joined_at' => now(),
        ]);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $member->user_id,
            'action' => 'joined',
            'acted_at' => now(),
        ]);

        return back()->with('success', 'Member berhasil diterima.');
    }

    public function updateRole(UpdateMemberRoleRequest $request, Community $community, CommunityMember $member)
    {
        $this->authorize('manageMembers', $community);

        if ($member->community_id !== $community->id) {
            return back()->with('error', 'Member tidak valid.');
        }

        $member->update(['role' => $request->role]);

        CommunityMemberRole::updateOrCreate(
            ['community_id' => $community->id, 'user_id' => $member->user_id, 'role' => $request->role],
            [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ]
        );

        return back()->with('success', 'Role member berhasil diubah.');
    }

    public function remove(Community $community, CommunityMember $member)
    {
        $this->authorize('manageMembers', $community);

        if ($member->community_id !== $community->id) {
            return back()->with('error', 'Member tidak valid.');
        }

        $member->update(['status' => 'left']);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $member->user_id,
            'action' => 'left',
            'reason' => 'Dikeluarkan oleh admin',
            'acted_at' => now(),
        ]);

        return back()->with('success', 'Member berhasil dikeluarkan.');
    }

    public function ban(BanMemberRequest $request, Community $community, CommunityMember $member)
    {
        $this->authorize('manageMembers', $community);

        if ($member->community_id !== $community->id) {
            return back()->with('error', 'Member tidak valid.');
        }

        $member->update([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => $request->reason,
        ]);

        CommunityBan::updateOrCreate(
            ['community_id' => $community->id, 'user_id' => $member->user_id],
            [
                'banned_by' => auth()->id(),
                'reason' => $request->reason,
                'banned_at' => now(),
                'status' => 'active',
            ]
        );

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $member->user_id,
            'action' => 'banned',
            'reason' => $request->reason,
            'acted_at' => now(),
        ]);

        return back()->with('success', 'Member berhasil dibanned.');
    }

    public function unban(Community $community, CommunityMember $member)
    {
        $this->authorize('manageMembers', $community);

        if ($member->community_id !== $community->id) {
            return back()->with('error', 'Member tidak valid.');
        }

        $member->update([
            'status' => 'active',
            'banned_at' => null,
            'ban_reason' => null,
            'joined_at' => now(),
        ]);

        CommunityBan::where('community_id', $community->id)
            ->where('user_id', $member->user_id)
            ->update([
                'status' => 'unbanned',
                'unbanned_at' => now(),
            ]);

        MemberJoinHistory::create([
            'community_id' => $community->id,
            'user_id' => $member->user_id,
            'action' => 'unbanned',
            'acted_at' => now(),
        ]);

        return back()->with('success', 'Member berhasil di-unban.');
    }
}
