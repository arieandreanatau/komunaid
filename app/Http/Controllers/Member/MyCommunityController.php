<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MyCommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunityMember::where('user_id', auth()->id())
            ->with('community.category')
            ->latest('joined_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('community', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $communities = $query->paginate(15);

        return view('member.communities.index', compact('communities'));
    }

    public function show(Community $community)
    {
        $user = auth()->user();

        $membership = CommunityMember::where('community_id', $community->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            return back()->with('error', 'Anda bukan anggota komunitas ini.');
        }

        $community->load('category');
        $membersCount = $community->activeMembers()->count();

        return view('member.communities.show', compact('community', 'membership'));
    }

    public function export(): Response
    {
        $user = auth()->user();
        $memberships = CommunityMember::where('user_id', $user->id)
            ->with('community.category')
            ->latest('joined_at')
            ->get();

        $filename = 'komunaid_member_communities_' . date('Ymd') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($memberships) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Community ID', 'Name', 'Category', 'Location', 'Role', 'Status', 'Joined At']);

            foreach ($memberships as $membership) {
                fputcsv($file, [
                    $membership->community_id,
                    $membership->community->name ?? '-',
                    $membership->community->category->name ?? '-',
                    trim(($membership->community->city ?? '') . ', ' . ($membership->community->province ?? ''), ', '),
                    $membership->role ?? '-',
                    $membership->status,
                    $membership->joined_at ? $membership->joined_at->format('Y-m-d H:i') : '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
