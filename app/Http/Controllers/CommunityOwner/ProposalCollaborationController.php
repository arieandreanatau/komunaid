<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityOwner\RejectCollaborationProposalRequest;
use App\Models\CollaborationProposal;
use App\Models\Community;
use App\Services\CollaborationProposalService;
use App\Services\CsvExportService;
use Illuminate\Http\Request;

class ProposalCollaborationController extends Controller
{
    protected $proposalService;

    public function __construct(CollaborationProposalService $proposalService)
    {
        $this->proposalService = $proposalService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        $query = CollaborationProposal::where('target_type', 'community')
            ->whereIn('target_id', $communityIds)
            ->with('collaborationType', 'creator');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('community_id')) {
            $query->where('target_id', $request->community_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('proposer_type', 'like', "%{$search}%");
            });
        }

        $proposals = $query->latest()->paginate(10);
        $communities = Community::where('owner_id', $user->id)->get();

        return view('community-owner.proposals.index', compact('proposals', 'communities'));
    }

    public function show(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        $proposal->load('collaborationType', 'creator', 'reviewedBy');

        if ($proposal->proposer_type === 'brand') {
            $proposal->load('proposer');
        } elseif ($proposal->proposer_type === 'company') {
            $proposal->load('proposer');
        }

        if ($proposal->target_type === 'community') {
            $proposal->load('target');
        }

        return view('community-owner.proposals.show', compact('proposal'));
    }

    public function review(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        if (!in_array($proposal->status, ['sent'])) {
            return back()->with('error', 'Proposal ini tidak bisa di-review.');
        }

        $this->proposalService->reviewProposal($proposal, $user);

        return back()->with('success', 'Proposal berhasil di-review.');
    }

    public function accept(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        if (!in_array($proposal->status, ['sent', 'reviewed'])) {
            return back()->with('error', 'Proposal ini tidak bisa diterima.');
        }

        $this->proposalService->acceptProposal($proposal);

        return back()->with('success', 'Proposal berhasil diterima.');
    }

    public function reject(RejectCollaborationProposalRequest $request, CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        if (!in_array($proposal->status, ['sent', 'reviewed'])) {
            return back()->with('error', 'Proposal ini tidak bisa ditolak.');
        }

        $this->proposalService->rejectProposal($proposal, $request->response_note);

        return back()->with('success', 'Proposal berhasil ditolak.');
    }

    public function complete(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        if ($proposal->status !== 'accepted') {
            return back()->with('error', 'Hanya proposal yang diterima yang bisa diselesaikan.');
        }

        $this->proposalService->completeProposal($proposal);

        return back()->with('success', 'Proposal berhasil diselesaikan.');
    }

    public function cancel(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canRespondToProposal($proposal, $user)) {
            abort(403);
        }

        if (!$proposal->isCancellable()) {
            return back()->with('error', 'Proposal ini tidak bisa dibatalkan.');
        }

        $this->proposalService->cancelProposal($proposal);

        return back()->with('success', 'Proposal berhasil dibatalkan.');
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $communityIds = Community::where('owner_id', $user->id)->pluck('id');

        $proposals = CollaborationProposal::where('target_type', 'community')
            ->whereIn('target_id', $communityIds)
            ->with('collaborationType', 'creator', 'reviewedBy')
            ->latest()
            ->get();

        $service = new CsvExportService();
        $service->exportCollaborations($proposals);
    }
}
