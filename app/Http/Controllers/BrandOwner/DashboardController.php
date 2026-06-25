<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Campaign;
use App\Models\CollaborationProposal;
use App\Models\CollaborationRequest;
use App\Models\Community;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $ownedBrands = Brand::where('owner_id', $user->id)->latest()->get();
        $brandIds = $ownedBrands->pluck('id');

        $totalCampaigns = Campaign::whereIn('brand_id', $brandIds)->count();
        $activeCampaigns = Campaign::whereIn('brand_id', $brandIds)
            ->where('status', 'active')
            ->count();

        $totalCollaborations = CollaborationRequest::whereIn('brand_id', $brandIds)->count();
        $pendingCollaborations = CollaborationRequest::whereIn('brand_id', $brandIds)
            ->where('status', 'pending')
            ->count();

        $proposalDraft = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->where('status', 'draft')
            ->count();
        $proposalSent = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->where('status', 'sent')
            ->count();
        $proposalAccepted = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->where('status', 'accepted')
            ->count();
        $proposalRejected = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->where('status', 'rejected')
            ->count();
        $totalProposals = $proposalDraft + $proposalSent + $proposalAccepted + $proposalRejected
            + CollaborationProposal::where('proposer_type', 'brand')
                ->whereIn('proposer_id', $brandIds)
                ->whereIn('status', ['completed', 'cancelled', 'archived'])
                ->count();

        $latestBrands = $ownedBrands->take(5);
        $latestProposals = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->with('collaborationType', 'target')
            ->latest()
            ->take(5)
            ->get();

        $recommendedCommunities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            'total_brands' => $ownedBrands->count(),
            'active_brands' => $ownedBrands->whereIn('status', ['active', 'approved'])->count(),
            'verified_brands' => $ownedBrands->where('is_verified', true)->count(),
            'pending_brands' => $ownedBrands->where('status', 'pending')->count(),
            'approved_brands' => $ownedBrands->where('status', 'approved')->count(),
            'total_campaigns' => $totalCampaigns,
            'active_campaigns' => $activeCampaigns,
            'total_collaborations' => $totalCollaborations,
            'pending_collaborations' => $pendingCollaborations,
            'total_proposals' => $totalProposals,
            'proposal_draft' => $proposalDraft,
            'proposal_sent' => $proposalSent,
            'proposal_accepted' => $proposalAccepted,
            'proposal_rejected' => $proposalRejected,
        ];

        return view('brand.dashboard', compact('user', 'ownedBrands', 'stats', 'latestBrands', 'latestProposals', 'recommendedCommunities'));
    }
}
