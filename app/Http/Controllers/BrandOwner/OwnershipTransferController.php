<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\User;
use App\Services\Brand\BrandOwnershipService;
use Illuminate\Http\Request;

class OwnershipTransferController extends Controller
{
    protected $ownershipService;

    public function __construct(BrandOwnershipService $ownershipService)
    {
        $this->ownershipService = $ownershipService;
    }

    public function show(Brand $brand)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageBrand($brand, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk mentransfer brand ini.');
        }

        if ($brand->isSuspendedOrBanned()) {
            return back()->with('error', 'Brand yang disuspend/banned tidak bisa ditransfer.');
        }

        $brand->load('owner');

        return view('brand.brands.transfer-owner', compact('brand'));
    }

    public function store(Request $request, Brand $brand)
    {
        $user = auth()->user();

        if (!$this->ownershipService->canManageBrand($brand, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk mentransfer brand ini.');
        }

        $request->validate([
            'new_owner_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:1000',
        ]);

        $newOwner = User::find($request->new_owner_id);

        if ($newOwner->id === $user->id) {
            return back()->with('error', 'Owner baru tidak boleh sama dengan owner saat ini.');
        }

        if ($newOwner->hasAnyRole(['suspended', 'banned']) || $newOwner->banned_at !== null) {
            return back()->with('error', 'User target tidak aktif atau telah dibanned.');
        }

        $this->ownershipService->transferBrand($brand, $newOwner, $request->reason);

        return redirect()->route('brand.brands.index')
            ->with('success', 'Transfer ownership brand berhasil.');
    }
}
