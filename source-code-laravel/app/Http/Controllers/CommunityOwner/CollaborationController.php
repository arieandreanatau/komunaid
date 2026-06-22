<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Collaboration;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CollaborationController extends Controller
{
    use AuthorizesRequests;

    public function index(Community $community)
    {
        $this->authorizeCommunity($community);
        $collaborations = $community->collaborations()->with(['brand', 'campaign'])->latest()->paginate(10);
        return view('community-owner.collaborations.index', compact('community', 'collaborations'));
    }

    public function approve(Collaboration $collaboration)
    {
        $this->authorizeCommunity($collaboration->community);
        $collaboration->update(['status' => 'approved']);
        return redirect()->back()->with('success', 'Kolaborasi berhasil di-approve.');
    }

    public function reject(Collaboration $collaboration)
    {
        $this->authorizeCommunity($collaboration->community);
        $collaboration->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Kolaborasi berhasil ditolak.');
    }

    private function authorizeCommunity(Community $community): void
    {
        if ($community->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }
    }
}
