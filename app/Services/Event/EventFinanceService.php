<?php

namespace App\Services\Event;

use App\Models\Event;
use App\Models\EventDonation;
use App\Models\EventFinanceSummary;
use App\Models\EventFinanceTransaction;
use Illuminate\Support\Facades\DB;

class EventFinanceService
{
    public function recomputeSummary(Event $event): EventFinanceSummary
    {
        return DB::transaction(function () use ($event) {
            $verifiedDonation = (float) EventDonation::query()
                ->where('event_id', $event->id)
                ->where('status', 'verified')
                ->sum('amount');

            $verifiedIncomeTx = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'income')
                ->where('status', 'verified')
                ->sum('amount');

            $verifiedExpenseTx = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'expense')
                ->where('status', 'verified')
                ->sum('amount');

            $totalIncome = $verifiedDonation + $verifiedIncomeTx;
            $totalExpense = $verifiedExpenseTx;
            $balance = $totalIncome - $totalExpense;

            return EventFinanceSummary::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'balance' => $balance,
                    'last_calculated_at' => now(),
                ]
            );
        });
    }

    public function netBalance(Event $event): float
    {
        $summary = $this->recomputeSummary($event);
        return (float) $summary->balance;
    }
}
