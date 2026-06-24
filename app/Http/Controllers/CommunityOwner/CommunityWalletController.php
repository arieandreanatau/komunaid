<?php

namespace App\Http\Controllers\CommunityOwner;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Services\PlatformFeeService;
use App\Services\WalletService;

class CommunityWalletController extends Controller
{
    protected WalletService $walletService;
    protected PlatformFeeService $platformFeeService;

    public function __construct(WalletService $walletService, PlatformFeeService $platformFeeService)
    {
        $this->walletService = $walletService;
        $this->platformFeeService = $platformFeeService;
    }

    public function index()
    {
        $user = auth()->user();
        $ownedCommunities = Community::where('owner_id', $user->id)->get();

        $wallet = $this->walletService->getOrCreateWallet($user);
        $transactions = $this->walletService->getTransactions($user, 20);

        $totalEventIncome = 0;
        $totalDonationIncome = 0;
        foreach ($ownedCommunities as $community) {
            $totalEventIncome += $this->platformFeeService->getCommunityNetIncome($community->id);
        }
        $totalDonationIncome = $wallet->transactions()->completed()->where('category', 'donation')->sum('amount');

        return view('community.wallet.index', compact('wallet', 'transactions', 'ownedCommunities', 'totalEventIncome', 'totalDonationIncome'));
    }
}
