<?php

namespace App\Http\Controllers\BrandOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandOwner\StoreCollaborationProposalRequest;
use App\Http\Requests\BrandOwner\UpdateCollaborationProposalRequest;
use App\Models\Brand;
use App\Models\CollaborationProposal;
use App\Models\CollaborationType;
use App\Models\Community;
use App\Services\CollaborationProposalService;
use App\Services\CsvExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $brandIds = Brand::where('owner_id', $user->id)->pluck('id');

        $query = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->with('collaborationType', 'target');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $proposals = $query->latest()->paginate(10);

        return view('brand.proposals.index', compact('proposals'));
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $brands = Brand::where('owner_id', $user->id)
            ->whereIn('status', ['active', 'approved'])
            ->get();

        $communities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->latest()
            ->get();

        $collaborationTypes = CollaborationType::where('is_active', true)->get();

        $selectedCommunity = $request->query('community_id');

        return view('brand.proposals.create', compact('brands', 'communities', 'collaborationTypes', 'selectedCommunity'));
    }

    public function store(StoreCollaborationProposalRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();

        if ($data['proposer_type'] === 'brand') {
            $brand = Brand::where('id', $data['proposer_id'])
                ->where('owner_id', $user->id)
                ->first();
            if (!$brand) {
                return back()->with('error', 'Brand tidak ditemukan atau bukan milik Anda.');
            }
            if ($brand->isSuspendedOrBanned()) {
                return back()->with('error', 'Brand yang disuspend/banned tidak bisa mengajukan proposal.');
            }
        }

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('collaboration/attachments', 'public');
        }

        unset($data['attachment']);

        $proposal = $this->proposalService->createDraft($data, $user);

        return redirect()->route('brand.proposals.show', $proposal)
            ->with('success', 'Proposal kolaborasi berhasil dibuat sebagai draft.');
    }

    public function show(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canManageProposal($proposal, $user)) {
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

        return view('brand.proposals.show', compact('proposal'));
    }

    public function edit(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canManageProposal($proposal, $user)) {
            abort(403);
        }

        if (!$proposal->isEditable()) {
            return back()->with('error', 'Proposal yang sudah dikirim tidak bisa diedit.');
        }

        $collaborationTypes = CollaborationType::where('is_active', true)->get();

        $proposal->load('proposer', 'target');

        return view('brand.proposals.edit', compact('proposal', 'collaborationTypes'));
    }

    public function update(UpdateCollaborationProposalRequest $request, CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canManageProposal($proposal, $user)) {
            abort(403);
        }

        if (!$proposal->isEditable()) {
            return back()->with('error', 'Proposal yang sudah dikirim tidak bisa diedit.');
        }

        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            if ($proposal->attachment_path) {
                Storage::disk('public')->delete($proposal->attachment_path);
            }
            $data['attachment_path'] = $request->file('attachment')->store('collaboration/attachments', 'public');
        }

        unset($data['attachment']);
        $proposal->update($data);

        return redirect()->route('brand.proposals.show', $proposal)
            ->with('success', 'Proposal berhasil diperbarui.');
    }

    public function send(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canManageProposal($proposal, $user)) {
            abort(403);
        }

        if (!$proposal->isDraft()) {
            return back()->with('error', 'Hanya draft yang bisa dikirim.');
        }

        $this->proposalService->sendProposal($proposal);

        return redirect()->route('brand.proposals.show', $proposal)
            ->with('success', 'Proposal berhasil dikirim ke komunitas target.');
    }

    public function cancel(CollaborationProposal $proposal)
    {
        $user = auth()->user();

        if (!$this->proposalService->canManageProposal($proposal, $user)) {
            abort(403);
        }

        if (!$proposal->isCancellable()) {
            return back()->with('error', 'Proposal ini tidak bisa dibatalkan.');
        }

        $this->proposalService->cancelProposal($proposal);

        return redirect()->route('brand.proposals.index')
            ->with('success', 'Proposal berhasil dibatalkan.');
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $brandIds = Brand::where('owner_id', $user->id)->pluck('id');

        $proposals = CollaborationProposal::where('proposer_type', 'brand')
            ->whereIn('proposer_id', $brandIds)
            ->with('collaborationType', 'creator', 'reviewedBy')
            ->latest()
            ->get();

        $service = new CsvExportService();
        $service->exportCollaborations($proposals);
    }
}
