<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile')->role('member');

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $members = $query->latest()->paginate(15);

        return view('superadmin.members.index', compact('members'));
    }

    public function show(User $user)
    {
        $user->load(['profile', 'wallet', 'memberCommunities', 'roleRequests']);
        return view('superadmin.members.show', compact('user'));
    }
}
