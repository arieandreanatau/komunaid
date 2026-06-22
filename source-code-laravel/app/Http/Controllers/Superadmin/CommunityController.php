<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Approval;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = Community::with('owner')->withCount('members');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $communities = $query->latest()->paginate(15);

        return view('superadmin.communities.index', compact('communities'));
    }

    public function show(Community $community)
    {
        $community->load(['owner', 'members']);
        return view('superadmin.communities.show', compact('community'));
    }

    public function approve(Community $community)
    {
        $community->update(['status' => 'approved']);

        Approval::where('approvable_type', Community::class)
            ->where('approvable_id', $community->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

        return redirect()->back()->with('success', 'Komunitas berhasil di-approve.');
    }

    public function reject(Community $community)
    {
        $community->update(['status' => 'rejected']);

        Approval::where('approvable_type', Community::class)
            ->where('approvable_id', $community->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

        return redirect()->back()->with('success', 'Komunitas berhasil ditolak.');
    }
}
