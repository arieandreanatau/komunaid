<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Brand;
use App\Models\User;
use App\Models\CommunityOwnershipTransfer;
use App\Models\BrandOwnershipTransfer;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class OwnershipTransferController extends Controller
{
    public function showCommunityTransfer(Community $community)
    {
        $community->load('owner');
        $users = User::whereNull('banned_at')
            ->where('id', '!=', $community->owner_id)
            ->get();

        return view('superadmin.communities.transfer-owner', compact('community', 'users'));
    }

    public function storeCommunityTransfer(Request $request, Community $community)
    {
        $validated = $request->validate([
            'new_owner_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:1000',
        ]);

        if ($validated['new_owner_id'] == $community->owner_id) {
            return back()->with('error', 'Owner baru tidak boleh sama dengan owner lama.');
        }

        $newOwner = User::findOrFail($validated['new_owner_id']);
        if ($newOwner->banned_at !== null) {
            return back()->with('error', 'User baru tidak boleh dalam status banned.');
        }

        $oldOwnerId = $community->owner_id;

        $community->update(['owner_id' => $validated['new_owner_id']]);

        if (!$newOwner->hasRole('community_owner')) {
            $newOwner->assignRole('community_owner');
        }

        CommunityOwnershipTransfer::create([
            'community_id' => $community->id,
            'old_owner_id' => $oldOwnerId,
            'new_owner_id' => $validated['new_owner_id'],
            'transferred_by' => auth()->id(),
            'reason' => $validated['reason'] ?? null,
            'transferred_at' => now(),
            'status' => 'completed',
        ]);

        AuditLog::log('community_ownership_transferred', $community, 'Ownership komunitas ditransfer dari user #' . $oldOwnerId . ' ke user #' . $validated['new_owner_id'] . '. Alasan: ' . ($validated['reason'] ?? '-'), ['old_owner_id' => $oldOwnerId], ['new_owner_id' => $validated['new_owner_id']]);

        return redirect()->route('superadmin.communities.show', $community)->with('success', 'Ownership komunitas berhasil ditransfer.');
    }

    public function showBrandTransfer(Brand $brand)
    {
        $brand->load('owner');
        $users = User::whereNull('banned_at')
            ->where('id', '!=', $brand->owner_id)
            ->get();

        return view('superadmin.brands.transfer-owner', compact('brand', 'users'));
    }

    public function storeBrandTransfer(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'new_owner_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:1000',
        ]);

        if ($validated['new_owner_id'] == $brand->owner_id) {
            return back()->with('error', 'Owner baru tidak boleh sama dengan owner lama.');
        }

        $newOwner = User::findOrFail($validated['new_owner_id']);
        if ($newOwner->banned_at !== null) {
            return back()->with('error', 'User baru tidak boleh dalam status banned.');
        }

        $oldOwnerId = $brand->owner_id;

        $brand->update(['owner_id' => $validated['new_owner_id']]);

        if (!$newOwner->hasRole('brand_owner')) {
            $newOwner->assignRole('brand_owner');
        }

        BrandOwnershipTransfer::create([
            'brand_id' => $brand->id,
            'old_owner_id' => $oldOwnerId,
            'new_owner_id' => $validated['new_owner_id'],
            'transferred_by' => auth()->id(),
            'reason' => $validated['reason'] ?? null,
            'transferred_at' => now(),
            'status' => 'completed',
        ]);

        AuditLog::log('brand_ownership_transferred', $brand, 'Ownership brand ditransfer dari user #' . $oldOwnerId . ' ke user #' . $validated['new_owner_id'] . '. Alasan: ' . ($validated['reason'] ?? '-'), ['old_owner_id' => $oldOwnerId], ['new_owner_id' => $validated['new_owner_id']]);

        return redirect()->route('superadmin.brands.show', $brand)->with('success', 'Ownership brand berhasil ditransfer.');
    }
}
