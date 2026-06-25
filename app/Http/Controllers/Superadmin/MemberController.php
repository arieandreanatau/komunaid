<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles', 'profile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn($q) => $q->where('name', $request->role));
        }

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereNull('banned_at');
            } elseif ($status === 'suspended' || $status === 'banned') {
                $query->whereNotNull('banned_at');
            }
        }

        $members = $query->latest()->paginate(20);

        return view('superadmin.members.index', compact('members'));
    }

    public function show(User $user)
    {
        $user->load(['roles', 'profile', 'ownedCommunities', 'ownedBrands', 'communityMemberships.community', 'eventRegistrations.event', 'loginLogs']);
        $roleRequestHistory = $user->roleRequests()->latest()->take(10)->get();

        return view('superadmin.members.show', compact('user', 'roleRequestHistory'));
    }

    public function edit(User $user)
    {
        $user->load(['profile']);

        return view('superadmin.members.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $old = $user->only(['name', 'username', 'email']);
        $user->update($validated);

        AuditLog::log('member_updated', $user, 'Data member diperbarui: ' . $user->name, $old, $validated);

        return redirect()->route('superadmin.members.show', $user)->with('success', 'Data member berhasil diperbarui.');
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('member_suspended', $user, 'Member disuspend: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Member berhasil disuspend.');
    }

    public function ban(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('member_banned', $user, 'Member dibanned: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Member berhasil dibanned.');
    }

    public function activate(User $user)
    {
        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => null]);

        AuditLog::log('member_activated', $user, 'Member diaktifkan: ' . $user->name, $old, ['banned_at' => null]);

        return back()->with('success', 'Member berhasil diaktifkan.');
    }

    public function destroy(User $user)
    {
        $user->update(['banned_at' => now()]);

        AuditLog::log('member_soft_deleted', $user, 'Member soft deleted: ' . $user->name);

        return redirect()->route('superadmin.members.index')->with('success', 'Member berhasil dinonaktifkan.');
    }

    public function export(Request $request)
    {
        $query = User::with('roles');

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereNull('banned_at');
            } elseif ($status === 'suspended' || $status === 'banned') {
                $query->whereNotNull('banned_at');
            }
        }

        $members = $query->latest()->get();

        $filename = 'komunaid_members_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($members) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Username', 'Email', 'Status', 'Roles', 'Created At', 'Last Login']);

            foreach ($members as $member) {
                fputcsv($handle, [
                    $member->id,
                    $member->name,
                    $member->username,
                    $member->email,
                    $member->banned_at ? 'Banned' : 'Active',
                    $member->roles->pluck('name')->implode(', '),
                    $member->created_at?->format('Y-m-d H:i'),
                    $member->loginLogs()->latest()->first()?->created_at?->format('Y-m-d H:i') ?? '-',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
