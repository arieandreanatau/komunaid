<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Brand $brand)
    {
        $this->authorizeBrand($brand);

        $members = $brand->members()->with('user')->latest()->paginate(10);

        return view('brand-owner.staff.index', compact('brand', 'members'));
    }

    public function store(Request $request, Brand $brand)
    {
        $this->authorizeBrand($brand);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string|max:50',
        ]);

        $existing = BrandMember::where('brand_id', $brand->id)
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            return back()->with('error', 'User ini sudah terdaftar sebagai anggota brand.');
        }

        BrandMember::create([
            'brand_id' => $brand->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'] ?? 'staff',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return back()->with('success', 'Staff berhasil ditambahkan.');
    }

    public function remove(Brand $brand, BrandMember $member)
    {
        $this->authorizeBrand($brand);
        $member->delete();

        return back()->with('success', 'Staff berhasil dihapus.');
    }

    public function searchUsers(Request $request, Brand $brand)
    {
        $this->authorizeBrand($brand);

        $query = $request->input('q', '');

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
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

    private function authorizeBrand(Brand $brand): void
    {
        if ($brand->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
