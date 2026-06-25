<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class BrandOwnerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles', 'profile')
            ->whereHas('roles', fn($q) => $q->where('name', 'brand_owner'));

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

        $brandOwners = $query->latest()->paginate(20);

        return view('superadmin.brand-owners.index', compact('brandOwners'));
    }

    public function show(User $user)
    {
        $user->load(['roles', 'profile', 'ownedBrands']);
        $brandsCount = $user->ownedBrands()->count();
        $roleRequestHistory = $user->roleRequests()->latest()->take(10)->get();

        return view('superadmin.brand-owners.show', compact('user', 'brandsCount', 'roleRequestHistory'));
    }

    public function brands(User $user)
    {
        $brands = $user->ownedBrands()->latest()->paginate(20);

        return view('superadmin.brand-owners.brands', compact('user', 'brands'));
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $activeBrands = $user->ownedBrands()->where('status', 'approved')->count();
        if ($activeBrands > 0) {
            return back()->with('error', "User ini masih memiliki {$activeBrands} brand aktif. Transfer ownership terlebih dahulu sebelum suspend.");
        }

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('brand_owner_suspended', $user, 'Brand owner disuspend: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Brand owner berhasil disuspend.');
    }

    public function ban(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $activeBrands = $user->ownedBrands()->where('status', 'approved')->count();
        if ($activeBrands > 0) {
            return back()->with('error', "User ini masih memiliki {$activeBrands} brand aktif. Transfer ownership terlebih dahulu sebelum ban.");
        }

        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => now()]);

        AuditLog::log('brand_owner_banned', $user, 'Brand owner dibanned: ' . $user->name . '. Alasan: ' . $request->reason, $old, ['banned_at' => now()->toDateTimeString()]);

        return back()->with('success', 'Brand owner berhasil dibanned.');
    }

    public function activate(User $user)
    {
        $old = ['banned_at' => $user->banned_at];
        $user->update(['banned_at' => null]);

        AuditLog::log('brand_owner_activated', $user, 'Brand owner diaktifkan: ' . $user->name, $old, ['banned_at' => null]);

        return back()->with('success', 'Brand owner berhasil diaktifkan.');
    }

    public function export(Request $request)
    {
        $owners = User::with('roles')
            ->whereHas('roles', fn($q) => $q->where('name', 'brand_owner'))
            ->latest()
            ->get();

        $filename = 'komunaid_brand_owners_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($owners) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Username', 'Email', 'Status', 'Brands Count', 'Created At']);

            foreach ($owners as $owner) {
                fputcsv($handle, [
                    $owner->id,
                    $owner->name,
                    $owner->username,
                    $owner->email,
                    $owner->banned_at ? 'Banned' : 'Active',
                    $owner->ownedBrands()->count(),
                    $owner->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
