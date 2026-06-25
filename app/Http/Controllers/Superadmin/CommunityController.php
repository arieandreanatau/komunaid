<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = Community::with('owner', 'category');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        if ($request->filled('owner')) {
            $query->where('owner_id', $request->owner);
        }

        $communities = $query->latest()->paginate(20);

        return view('superadmin.communities.index', compact('communities'));
    }

    public function show(Community $community)
    {
        $community->load(['owner', 'category', 'members.user', 'events']);
        $membersCount = $community->activeMembers()->count();
        $pendingCount = $community->pendingMembers()->count();
        $bannedCount = $community->bannedMembers()->count();

        return view('superadmin.communities.show', compact('community', 'membersCount', 'pendingCount', 'bannedCount'));
    }

    public function approve(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'approved']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'community',
            'approvable_id' => $community->id,
            'approvable_type' => Community::class,
            'action' => 'approved',
            'notes' => 'Komunitas disetujui dari halaman manajemen.',
        ]);

        AuditLog::log('community_approved', $community, 'Komunitas disetujui: ' . $community->name, $old, ['status' => 'approved']);

        return back()->with('success', 'Komunitas berhasil disetujui.');
    }

    public function reject(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'community',
            'approvable_id' => $community->id,
            'approvable_type' => Community::class,
            'action' => 'rejected',
            'notes' => 'Komunitas ditolak dari halaman manajemen.',
        ]);

        AuditLog::log('community_rejected', $community, 'Komunitas ditolak: ' . $community->name, $old, ['status' => 'rejected']);

        return back()->with('success', 'Komunitas berhasil ditolak.');
    }

    public function suspend(Request $request, Community $community)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $community->status];
        $community->update(['status' => 'suspended']);

        AuditLog::log('community_suspended', $community, 'Komunitas disuspend: ' . $community->name . '. Alasan: ' . $request->reason, $old, ['status' => 'suspended']);

        return back()->with('success', 'Komunitas berhasil disuspend.');
    }

    public function ban(Request $request, Community $community)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $old = ['status' => $community->status];
        $community->update(['status' => 'banned']);

        AuditLog::log('community_banned', $community, 'Komunitas dibanned: ' . $community->name . '. Alasan: ' . $request->reason, $old, ['status' => 'banned']);

        return back()->with('success', 'Komunitas berhasil dibanned.');
    }

    public function activate(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'approved']);

        AuditLog::log('community_activated', $community, 'Komunitas diaktifkan: ' . $community->name, $old, ['status' => 'approved']);

        return back()->with('success', 'Komunitas berhasil diaktifkan.');
    }

    public function destroy(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'archived']);

        AuditLog::log('community_deleted', $community, 'Komunitas dihapus (soft delete): ' . $community->name, $old, ['status' => 'archived']);

        return redirect()->route('superadmin.communities.index')->with('success', 'Komunitas berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $query = Community::with('owner', 'category');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $communities = $query->latest()->get();

        $filename = 'komunaid_communities_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($communities) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Slug', 'Owner', 'Category', 'City', 'Province', 'Status', 'Member Count', 'Created At']);

            foreach ($communities as $community) {
                fputcsv($handle, [
                    $community->id,
                    $community->name,
                    $community->slug,
                    $community->owner->name ?? '-',
                    $community->category->name ?? '-',
                    $community->city ?? '-',
                    $community->region ?? '-',
                    $community->status,
                    $community->activeMembers()->count(),
                    $community->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
