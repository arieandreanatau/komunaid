<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\StoreCommunityCollaborationRequest;
use App\Models\CollaborationRequest;
use App\Models\Community;
use Illuminate\Http\Request;

class CommunityCollaborationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        $incoming = CollaborationRequest::whereIn('community_id', $communityIds)
            ->with('brand', 'senderCommunity', 'creator')
            ->latest()
            ->paginate(10, 'page', 'incoming_page');

        $outgoing = CollaborationRequest::whereIn('sender_community_id', $communityIds)
            ->with('community', 'creator')
            ->latest()
            ->paginate(10, 'page', 'outgoing_page');

        return view('community.collaborations.index', compact('incoming', 'outgoing'));
    }

    public function create()
    {
        $user = auth()->user();
        $communities = Community::where('owner_id', $user->id)
            ->where('status', 'approved')
            ->get();

        $targetCommunities = Community::where('status', 'approved')
            ->where('owner_id', '!=', $user->id)
            ->get();

        return view('community.collaborations.create', compact('communities', 'targetCommunities'));
    }

    public function store(StoreCommunityCollaborationRequest $request)
    {
        $user = auth()->user();
        $senderCommunity = Community::where('id', $request->community_id)
            ->where('owner_id', $user->id)
            ->first();

        if (!$senderCommunity) {
            return back()->with('error', 'Komunitas pengirim tidak ditemukan atau bukan milik Anda.');
        }

        $data = $request->validated();
        $data['sender_community_id'] = $senderCommunity->id;
        $data['community_id'] = $data['target_community_id'];
        $data['created_by'] = $user->id;
        $data['status'] = 'pending';

        unset($data['target_community_id']);

        CollaborationRequest::create($data);

        return redirect()->route('community.collaborations.index')
            ->with('success', 'Collaboration request berhasil dikirim. Menunggu response dari komunitas target.');
    }

    public function show(CollaborationRequest $collaboration)
    {
        $this->authorize('view', $collaboration);

        $collaboration->load('brand', 'community', 'senderCommunity', 'creator');

        return view('community.collaborations.show', compact('collaboration'));
    }

    public function accept(CollaborationRequest $collaboration)
    {
        $this->authorize('respond', $collaboration);

        if (!$collaboration->canBeAccepted()) {
            return back()->with('error', 'Collaboration request tidak bisa diterima.');
        }

        $collaboration->update([
            'status' => 'accepted',
            'response_notes' => request('response_notes'),
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Collaboration request berhasil diterima.');
    }

    public function reject(CollaborationRequest $collaboration)
    {
        $this->authorize('respond', $collaboration);

        if (!$collaboration->canBeAccepted()) {
            return back()->with('error', 'Collaboration request tidak bisa ditolak.');
        }

        $collaboration->update([
            'status' => 'rejected',
            'response_notes' => request('response_notes'),
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Collaboration request berhasil ditolak.');
    }

    public function cancel(CollaborationRequest $collaboration)
    {
        $this->authorize('cancel', $collaboration);

        if (!$collaboration->canBeCancelled()) {
            return back()->with('error', 'Collaboration request tidak bisa dibatalkan.');
        }

        $collaboration->update(['status' => 'cancelled']);

        return back()->with('success', 'Collaboration request berhasil dibatalkan.');
    }

    public function complete(CollaborationRequest $collaboration)
    {
        $this->authorize('respond', $collaboration);

        if ($collaboration->status !== 'accepted') {
            return back()->with('error', 'Hanya collaboration yang sudah diterima yang bisa diselesaikan.');
        }

        $collaboration->update([
            'status' => 'completed',
            'response_notes' => request('response_notes', 'Collaboration selesai.'),
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Collaboration berhasil diselesaikan.');
    }
}
