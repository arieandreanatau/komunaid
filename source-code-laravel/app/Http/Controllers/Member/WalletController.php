<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class WalletController extends Controller
{
    public function index()
    {
        $wallet = auth()->user()->wallet;
        $transactions = $wallet
            ? $wallet->transactions()->latest()->paginate(15)
            : new LengthAwarePaginator(new Collection(), 0, 15);

        return view('member.wallet.index', compact('wallet', 'transactions'));
    }

    public function topup(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000|max:1000000',
        ]);

        $wallet = auth()->user()->wallet ?? Wallet::create([
            'user_id' => auth()->id(),
            'balance' => 0,
        ]);

        $wallet->credit($validated['amount'], 'Top up saldo (simulasi)');

        return redirect()->route('member.wallet.index')
            ->with('success', 'Top up berhasil. Saldo bertambah Rp ' . number_format($validated['amount'], 0, ',', '.'));
    }

    public function history()
    {
        $wallet = auth()->user()->wallet;
        $transactions = $wallet
            ? $wallet->transactions()->latest()->paginate(20)
            : new LengthAwarePaginator(new Collection(), 0, 20);

        return view('member.wallet.history', compact('transactions'));
    }
}
