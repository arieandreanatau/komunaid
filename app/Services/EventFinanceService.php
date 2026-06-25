<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventDonation;
use App\Models\EventFinanceSummary;
use App\Models\EventFinanceTransaction;
use Illuminate\Support\Facades\DB;

class EventFinanceService
{
    public function recalculateSummary(Event $event): EventFinanceSummary
    {
        $totalDonated = EventDonation::where('event_id', $event->id)
            ->where('status', 'verified')
            ->sum('amount');

        $totalIncome = EventFinanceTransaction::where('event_id', $event->id)
            ->where('type', 'income')
            ->where('status', 'verified')
            ->sum('amount');

        $totalExpense = EventFinanceTransaction::where('event_id', $event->id)
            ->where('type', 'expense')
            ->where('status', 'verified')
            ->sum('amount');

        $totalIncome = (float) $totalDonated + (float) $totalIncome;
        $totalExpense = (float) $totalExpense;
        $balance = $totalIncome - $totalExpense;

        $summary = EventFinanceSummary::firstOrCreate(
            ['event_id' => $event->id],
            [
                'total_income' => 0,
                'total_expense' => 0,
                'balance' => 0,
            ]
        );

        $summary->update([
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'balance' => $balance,
            'last_calculated_at' => now(),
        ]);

        return $summary;
    }
}
