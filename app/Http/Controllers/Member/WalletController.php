<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function index()
    {
        $user = auth()->user();
        $wallet = $this->walletService->getOrCreateWallet($user);
        $transactions = $this->walletService->getTransactions($user, 15);

        $totalCredits = $wallet->transactions()->completed()->credits()->sum('amount');
        $totalDebits = $wallet->transactions()->completed()->debits()->sum('amount');

        return view('member.wallet.index', compact('wallet', 'transactions', 'totalCredits', 'totalDebits'));
    }

    public function history()
    {
        $user = auth()->user();
        $wallet = $this->walletService->getOrCreateWallet($user);
        $transactions = $this->walletService->getTransactions($user, 25);

        return view('member.wallet.history', compact('wallet', 'transactions'));
    }
}
