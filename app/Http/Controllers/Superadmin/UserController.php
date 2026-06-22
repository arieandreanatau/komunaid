<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles', 'profile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
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
            } elseif ($status === 'suspended') {
                $query->whereNotNull('banned_at');
            }
        }

        $users = $query->latest()->paginate(20);

        return view('superadmin.users.index', compact('users'));
    }

    public function show(User $user)
    {
        $user->load(['roles', 'profile', 'ownedCommunities', 'ownedBrands']);
        $roleRequestHistory = $user->roleRequests()->latest()->take(10)->get();

        return view('superadmin.users.show', compact('user', 'roleRequestHistory'));
    }

    public function suspend(User $user)
    {
        $user->update(['banned_at' => now()]);

        AuditLog::log('user_suspended', $user, 'User disuspend: ' . $user->name);

        return back()->with('success', 'User berhasil disuspend.');
    }

    public function ban(User $user)
    {
        $user->update(['banned_at' => now()]);

        AuditLog::log('user_banned', $user, 'User dibanned: ' . $user->name);

        return back()->with('success', 'User berhasil dibanned.');
    }

    public function activate(User $user)
    {
        $user->update(['banned_at' => null]);

        AuditLog::log('user_activated', $user, 'User diaktifkan: ' . $user->name);

        return back()->with('success', 'User berhasil diaktifkan.');
    }
}
