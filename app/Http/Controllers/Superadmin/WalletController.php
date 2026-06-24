<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\PlatformFee;
use App\Models\User;
use App\Models\Community;
use App\Services\WalletService;
use App\Services\PlatformFeeService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function index(Request $request)
    {
        $query = User::with('wallet');

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return view('superadmin.wallets.index', compact('users'));
    }

    public function show(User $user)
    {
        $wallet = $this->walletService->getOrCreateWallet($user);
        $transactions = $this->walletService->getTransactions($user, 25);

        return view('superadmin.wallets.show', compact('user', 'wallet', 'transactions'));
    }

    public function adjust(Request $request, User $user)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'description' => 'required|string|max:255',
        ]);

        if ($validated['amount'] == 0) {
            return back()->with('error', 'Jumlah tidak boleh 0.');
        }

        $this->walletService->manualAdjustment(
            $user,
            (float) $validated['amount'],
            $validated['description'],
            'manual_adjustment'
        );

        return back()->with('success', 'Penyesuaian saldo berhasil.');
    }
}
