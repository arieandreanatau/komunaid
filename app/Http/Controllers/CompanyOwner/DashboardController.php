<?php

namespace App\Http\Controllers\CompanyOwner;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Company;
use App\Models\CollaborationProposal;
use App\Services\Finance\WalletService;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('profile');

        $ownedCompanies = Company::where('owner_id', $user->id)->latest()->get();
        $companyIds = $ownedCompanies->pluck('id');
        $brandIds = Brand::whereIn('company_id', $companyIds)->pluck('id');

        $totalCompanies = $ownedCompanies->count();
        $approvedCompanies = $ownedCompanies->where('status', 'approved')->count();
        $pendingCompanies = $ownedCompanies->where('status', 'pending')->count();
        $totalBrandsUnderCompanies = $brandIds->count();

        $proposalDraft = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            $q->where(function ($q2) use ($companyIds) {
                $q2->where('proposer_type', 'company')->whereIn('proposer_id', $companyIds);
            })->orWhere(function ($q2) use ($brandIds) {
                $q2->where('proposer_type', 'brand')->whereIn('proposer_id', $brandIds);
            });
        })->where('status', 'draft')->count();

        $proposalSent = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            $q->where(function ($q2) use ($companyIds) {
                $q2->where('proposer_type', 'company')->whereIn('proposer_id', $companyIds);
            })->orWhere(function ($q2) use ($brandIds) {
                $q2->where('proposer_type', 'brand')->whereIn('proposer_id', $brandIds);
            });
        })->where('status', 'sent')->count();

        $proposalAccepted = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            $q->where(function ($q2) use ($companyIds) {
                $q2->where('proposer_type', 'company')->whereIn('proposer_id', $companyIds);
            })->orWhere(function ($q2) use ($brandIds) {
                $q2->where('proposer_type', 'brand')->whereIn('proposer_id', $brandIds);
            });
        })->where('status', 'accepted')->count();

        $latestCompanies = $ownedCompanies->take(5);
        $latestBrands = Brand::whereIn('company_id', $companyIds)->latest()->take(5)->get();
        $latestProposals = CollaborationProposal::where(function ($q) use ($companyIds, $brandIds) {
            $q->where(function ($q2) use ($companyIds) {
                $q2->where('proposer_type', 'company')->whereIn('proposer_id', $companyIds);
            })->orWhere(function ($q2) use ($brandIds) {
                $q2->where('proposer_type', 'brand')->whereIn('proposer_id', $brandIds);
            });
        })->with('collaborationType', 'target')->latest()->take(5)->get();

        $walletService = app(WalletService::class);
        $wallet = $walletService->getOrCreateWallet($user);

        $stats = [
            'total_companies' => $totalCompanies,
            'active_companies' => $ownedCompanies->whereIn('status', ['active', 'approved'])->count(),
            'verified_companies' => $ownedCompanies->where('is_verified', true)->count(),
            'approved_companies' => $approvedCompanies,
            'pending_companies' => $pendingCompanies,
            'total_brands_under_companies' => $totalBrandsUnderCompanies,
            'total_proposals' => $proposalDraft + $proposalSent + $proposalAccepted,
            'proposal_draft' => $proposalDraft,
            'proposal_sent' => $proposalSent,
            'proposal_accepted' => $proposalAccepted,
            'wallet_balance' => $wallet->balance,
        ];

        return view('company-owner.dashboard', compact('user', 'ownedCompanies', 'stats', 'latestCompanies', 'latestBrands', 'latestProposals'));
    }
}
