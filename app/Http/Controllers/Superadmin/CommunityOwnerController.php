<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CommunityOwnerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles', 'profile')
            ->whereHas('roles', fn($q) => $q->where('name', 'community_owner'));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNull('banned_at');
            } elseif ($request->status === 'banned') {
                $query->whereNotNull('banned_at');
            }
        }

        $communityOwners = $query->latest()->paginate(20);

        return view('superadmin.community-owners.index', compact('communityOwners'));
    }

    public function show(User $user)
    {
        $user->load(['roles', 'profile', 'ownedCommunities.category']);
        $communitiesCount = $user->ownedCommunities()->count();
        $totalMembers = $user->ownedCommunities()->withCount('activeMembers')->get()->sum('active_members_count');
        $totalEvents = $user->ownedCommunities()->withCount('events')->get()->sum('events_count');
        $roleRequestHistory = $user->roleRequests()->latest()->take(10)->get();

        return view('superadmin.community-owners.show', compact('user', 'communitiesCount', 'totalMembers', 'totalEvents', 'roleRequestHistory'));
    }

    public function communities(User $user)
    {
        $communities = $user->ownedCommunities()->with('category', 'activeMembers')->latest()->paginate(20);

        return view('superadmin.community-owners.communities', compact('user', 'communities'));
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $activeCommunities = $user->ownedCommunities()->where('status', 'approved')->count();
        if ($activeCommunities > 0) {
            return back()->with('error', "User ini masih memiliki {$activeCommunities} komunitas aktif. Transfer ownership terlebih dahulu sebelum suspend.");
        }

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('community_owner_suspended', $user, 'Community owner disuspend: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Community owner berhasil disuspend.');
    }

    public function ban(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $activeCommunities = $user->ownedCommunities()->where('status', 'approved')->count();
        if ($activeCommunities > 0) {
            return back()->with('error', "User ini masih memiliki {$activeCommunities} komunitas aktif. Transfer ownership terlebih dahulu sebelum ban.");
        }

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('community_owner_banned', $user, 'Community owner dibanned: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Community owner berhasil dibanned.');
    }

    public function activate(User $user)
    {
        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => null]);

        AuditLog::log('community_owner_activated', $user, 'Community owner diaktifkan: ' . $user->name, $old, ['banned_at' => null]);

        return back()->with('success', 'Community owner berhasil diaktifkan.');
    }

    public function export(Request $request)
    {
        $owners = User::with('roles')
            ->whereHas('roles', fn($q) => $q->where('name', 'community_owner'))
            ->latest()
            ->get();

        $filename = 'komunaid_community_owners_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($owners) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Username', 'Email', 'Status', 'Communities Count', 'Created At']);

            foreach ($owners as $owner) {
                fputcsv($handle, [
                    $owner->id,
                    $owner->name,
                    $owner->username,
                    $owner->email,
                    $owner->banned_at ? 'Banned' : 'Active',
                    $owner->ownedCommunities()->count(),
                    $owner->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
