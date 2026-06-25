<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandOwner\StoreStaffRequest;
use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Brand $brand)
    {
        $this->authorize('manageMembers', $brand);

        $members = $brand->members()
            ->with('user.profile')
            ->latest()
            ->paginate(10);

        return view('brand.staff.index', compact('brand', 'members'));
    }

    public function store(StoreStaffRequest $request, Brand $brand)
    {
        $this->authorize('manageMembers', $brand);

        $existing = BrandMember::where('brand_id', $brand->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            return back()->with('error', 'User ini sudah terdaftar sebagai anggota brand.');
        }

        BrandMember::create([
            'brand_id' => $brand->id,
            'user_id' => $request->user_id,
            'role' => $request->input('role', 'staff'),
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return back()->with('success', 'Staff berhasil ditambahkan.');
    }

    public function remove(Brand $brand, BrandMember $member)
    {
        $this->authorize('manageMembers', $brand);

        $member->delete();

        return back()->with('success', 'Staff berhasil dihapus.');
    }

    public function searchUsers(Request $request, Brand $brand)
    {
        $this->authorize('manageMembers', $brand);

        $query = $request->input('q', '');

        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->where('id', '!=', $brand->owner_id)
            ->limit(10)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        return response()->json($users);
    }
}
