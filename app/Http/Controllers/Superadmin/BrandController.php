<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::with('owner');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $brands = $query->latest()->paginate(20);

        return view('superadmin.brands.index', compact('brands'));
    }

    public function show(Brand $brand)
    {
        $brand->load(['owner', 'members', 'campaigns', 'collaborationRequests']);
        $membersCount = $brand->activeMembers()->count();

        return view('superadmin.brands.show', compact('brand', 'membersCount'));
    }

    public function approve(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'approved']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'brand',
            'approvable_id' => $brand->id,
            'approvable_type' => Brand::class,
            'action' => 'approved',
            'notes' => 'Brand disetujui dari halaman manajemen.',
        ]);

        AuditLog::log('brand_approved', $brand, 'Brand disetujui: ' . $brand->name, $old, ['status' => 'approved']);

        return back()->with('success', 'Brand berhasil disetujui.');
    }

    public function reject(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'brand',
            'approvable_id' => $brand->id,
            'approvable_type' => Brand::class,
            'action' => 'rejected',
            'notes' => 'Brand ditolak dari halaman manajemen.',
        ]);

        AuditLog::log('brand_rejected', $brand, 'Brand ditolak: ' . $brand->name, $old, ['status' => 'rejected']);

        return back()->with('success', 'Brand berhasil ditolak.');
    }

    public function suspend(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'archived']);

        AuditLog::log('brand_suspended', $brand, 'Brand disuspend: ' . $brand->name, $old, ['status' => 'archived']);

        return back()->with('success', 'Brand berhasil disuspend.');
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        AuditLog::log('brand_deleted', $brand, 'Brand dihapus (soft delete): ' . $brand->name);

        return redirect()->route('superadmin.brands.index')->with('success', 'Brand berhasil dihapus.');
    }
}
