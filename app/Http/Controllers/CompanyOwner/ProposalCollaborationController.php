<?php

namespace App\Http\Controllers\CompanyOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyOwner\StoreCollaborationProposalRequest;
use App\Models\Brand;
use App\Models\Company;
use App\Models\CollaborationProposal;
use App\Models\CollaborationType;
use App\Models\Community;
use App\Services\Collaboration\CollaborationProposalService;
use App\Services\Export\CsvExportService;
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
        $companyIds = Company::where('owner_id', $user->id)->pluck('id');
        $brandIds = $companyIds->isEmpty() ? collect() : Brand::whereIn('company_id', $companyIds)->pluck('id');

        $query = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            if (!$companyIds->isEmpty() && !$brandIds->isEmpty()) {
                $q->where(function ($q2) use ($companyIds) {
                    $q2->where('proposer_type', 'company')
                       ->whereIn('proposer_id', $companyIds);
                })->orWhere(function ($q2) use ($brandIds) {
                    $q2->where('proposer_type', 'brand')
                       ->whereIn('proposer_id', $brandIds);
                });
            } elseif (!$companyIds->isEmpty()) {
                $q->where('proposer_type', 'company')
                   ->whereIn('proposer_id', $companyIds);
            } elseif (!$brandIds->isEmpty()) {
                $q->where('proposer_type', 'brand')
                   ->whereIn('proposer_id', $brandIds);
            } else {
                $q->whereRaw('0 = 1');
            }
        })->with('collaborationType', 'target');

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

        return view('company-owner.collaborations.index', compact('proposals'));
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $companies = Company::where('owner_id', $user->id)
            ->whereIn('status', ['active', 'approved'])
            ->get();

        $companyIds = $companies->pluck('id');
        $brands = Brand::whereIn('company_id', $companyIds)
            ->whereIn('status', ['active', 'approved'])
            ->get();

        $communities = Community::where('status', 'approved')
            ->where('is_public', true)
            ->latest()
            ->get();

        $collaborationTypes = CollaborationType::where('is_active', true)->get();

        $selectedCommunity = $request->query('community_id');

        return view('company-owner.collaborations.create', compact('companies', 'brands', 'communities', 'collaborationTypes', 'selectedCommunity'));
    }

    public function store(StoreCollaborationProposalRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();

        if ($data['proposer_type'] === 'company') {
            $company = Company::where('id', $data['proposer_id'])
                ->where('owner_id', $user->id)
                ->first();
            if (!$company) {
                return back()->with('error', 'Perusahaan tidak ditemukan atau bukan milik Anda.');
            }
            if ($company->isSuspendedOrBanned()) {
                return back()->with('error', 'Perusahaan yang disuspend/banned tidak bisa mengajukan proposal.');
            }
        } elseif ($data['proposer_type'] === 'brand') {
            $brand = Brand::where('id', $data['proposer_id'])
                ->where('company_id', Company::where('owner_id', $user->id)->pluck('id'))
                ->first();
            if (!$brand) {
                return back()->with('error', 'Brand tidak ditemukan atau bukan milik perusahaan Anda.');
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

        return redirect()->route('company-owner.collaborations.show', $proposal)
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

        return view('company-owner.collaborations.show', compact('proposal'));
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

        return redirect()->route('company-owner.collaborations.show', $proposal)
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

        return redirect()->route('company-owner.collaborations.index')
            ->with('success', 'Proposal berhasil dibatalkan.');
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $companyIds = Company::where('owner_id', $user->id)->pluck('id');
        $brandIds = $companyIds->isEmpty() ? collect() : Brand::whereIn('company_id', $companyIds)->pluck('id');

        $proposals = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            $q->where(function ($q2) use ($companyIds) {
                $q2->where('proposer_type', 'company')
                   ->whereIn('proposer_id', $companyIds);
            })->orWhere(function ($q2) use ($brandIds) {
                $q2->where('proposer_type', 'brand')
                   ->whereIn('proposer_id', $brandIds);
            });
        })->with('collaborationType', 'creator', 'reviewedBy')
          ->latest()
          ->get();

        $service = new CsvExportService();
        $service->exportCollaborations($proposals);
    }
}
