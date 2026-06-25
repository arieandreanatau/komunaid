<?php

namespace App\Services\Finance;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public function getOrCreateWallet(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );
    }

    public function getBalance(User $user): float
    {
        $wallet = $this->getOrCreateWallet($user);
        return (float) $wallet->balance;
    }

    public function credit(
        User $user,
        float $amount,
        string $description,
        ?string $category = null,
        $reference = null
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Credit amount must be greater than 0.');
        }

        return DB::transaction(function () use ($user, $amount, $description, $category, $reference) {
            $wallet = $this->getOrCreateWallet($user);
            $balanceBefore = (float) $wallet->balance;
            $balanceAfter = $balanceBefore + $amount;

            $wallet->update(['balance' => $balanceAfter]);

            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'description' => $description,
                'category' => $category,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference?->id,
                'status' => 'completed',
            ]);

            return $transaction;
        });
    }

    public function debit(
        User $user,
        float $amount,
        string $description,
        ?string $category = null,
        $reference = null
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Debit amount must be greater than 0.');
        }

        return DB::transaction(function () use ($user, $amount, $description, $category, $reference) {
            $wallet = $this->getOrCreateWallet($user);
            $balanceBefore = (float) $wallet->balance;

            if ($balanceBefore < $amount) {
                throw new \RuntimeException('Saldo wallet tidak mencukupi.');
            }

            $balanceAfter = $balanceBefore - $amount;
            $wallet->update(['balance' => $balanceAfter]);

            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'description' => $description,
                'category' => $category,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference?->id,
                'status' => 'completed',
            ]);

            return $transaction;
        });
    }

    public function manualAdjustment(
        User $user,
        float $amount,
        string $description,
        ?string $category = 'manual_adjustment'
    ): WalletTransaction {
        if ($amount > 0) {
            return $this->credit($user, $amount, $description, $category);
        } elseif ($amount < 0) {
            return $this->debit($user, abs($amount), $description, $category);
        }

        throw new \InvalidArgumentException('Adjustment amount cannot be 0.');
    }

    public function recalculateBalance(User $user): float
    {
        $wallet = $this->getOrCreateWallet($user);

        $credits = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('status', 'completed')
            ->where('type', 'credit')
            ->sum('amount');

        $debits = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('status', 'completed')
            ->where('type', 'debit')
            ->sum('amount');

        $balance = (float) $credits - (float) $debits;
        $wallet->update(['balance' => $balance]);

        return $balance;
    }

    public function getTransactions(User $user, int $perPage = 20)
    {
        $wallet = $this->getOrCreateWallet($user);

        return WalletTransaction::where('wallet_id', $wallet->id)
            ->latest()
            ->paginate($perPage);
    }
}
