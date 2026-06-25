<?php

namespace App\Services\Event;

use App\Models\Event;
use App\Models\EventFinanceSummary;
use App\Models\EventFinanceTransaction;
use Illuminate\Support\Facades\DB;

class EventFinanceService
{
    public function recomputeSummary(Event $event): EventFinanceSummary
    {
        return DB::transaction(function () use ($event) {
            $income = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'income')
                ->where('status', 'verified')
                ->sum('amount');

            $expense = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'expense')
                ->where('status', 'verified')
                ->sum('amount');

            $pendingIncome = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'income')
                ->where('status', 'pending')
                ->sum('amount');

            $pendingExpense = (float) EventFinanceTransaction::query()
                ->where('event_id', $event->id)
                ->where('type', 'expense')
                ->where('status', 'pending')
                ->sum('amount');

            return EventFinanceSummary::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'total_income' => $income,
                    'total_expense' => $expense,
                    'pending_income' => $pendingIncome,
                    'pending_expense' => $pendingExpense,
                    'net' => $income - $expense,
                    'last_recomputed_at' => now(),
                ]
            );
        });
    }

    public function netBalance(Event $event): float
    {
        $summary = $this->recomputeSummary($event);
        return (float) $summary->net;
    }
}
