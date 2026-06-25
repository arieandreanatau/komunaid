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

    public function suspend(Request $request, Brand $brand)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $brand->status];
        $brand->update(['status' => 'suspended']);

        AuditLog::log('brand_suspended', $brand, 'Brand disuspend: ' . $brand->name . '. Alasan: ' . $request->reason, $old, ['status' => 'suspended']);

        return back()->with('success', 'Brand berhasil disuspend.');
    }

    public function ban(Request $request, Brand $brand)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $brand->status];
        $brand->update(['status' => 'banned']);

        AuditLog::log('brand_banned', $brand, 'Brand dibanned: ' . $brand->name . '. Alasan: ' . $request->reason, $old, ['status' => 'banned']);

        return back()->with('success', 'Brand berhasil dibanned.');
    }

    public function verify(Brand $brand)
    {
        $old = ['is_verified' => $brand->is_verified, 'status' => $brand->status];
        $brand->update(['is_verified' => true, 'status' => 'active']);

        AuditLog::log('brand_verified', $brand, 'Brand diverifikasi: ' . $brand->name, $old, ['is_verified' => true, 'status' => 'active']);

        return back()->with('success', 'Brand berhasil diverifikasi.');
    }

    public function activate(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'active']);

        AuditLog::log('brand_activated', $brand, 'Brand diaktifkan: ' . $brand->name, $old, ['status' => 'active']);

        return back()->with('success', 'Brand berhasil diaktifkan.');
    }

    public function destroy(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'archived']);

        AuditLog::log('brand_deleted', $brand, 'Brand dihapus (soft delete): ' . $brand->name, $old, ['status' => 'archived']);

        return redirect()->route('superadmin.brands.index')->with('success', 'Brand berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $query = Brand::with('owner');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $brands = $query->latest()->get();

        $filename = 'komunaid_brands_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($brands) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Slug', 'Owner', 'Industry', 'Status', 'Created At']);

            foreach ($brands as $brand) {
                fputcsv($handle, [
                    $brand->id,
                    $brand->name,
                    $brand->slug,
                    $brand->owner->name ?? '-',
                    $brand->industry ?? '-',
                    $brand->status,
                    $brand->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
