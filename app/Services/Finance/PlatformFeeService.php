<?php

namespace App\Services\Finance;

use App\Models\PlatformFee;
use App\Models\EventPaymentConfirmation;
use App\Models\EventRegistration;
use App\Models\Event;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class PlatformFeeService
{
    protected WalletService $walletService;

    protected float $defaultFeePercent = 10.0;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function recordFee(EventPaymentConfirmation $payment): PlatformFee
    {
        $registration = $payment->registration;
        $event = $registration->event;
        $community = $event->community;

        $grossAmount = (float) $payment->amount_paid;
        $feePercent = (float) ($event->platform_fee ?? $this->defaultFeePercent);
        $platformFeeAmount = $grossAmount * ($feePercent / 100);
        $communityNetAmount = $grossAmount - $platformFeeAmount;

        return DB::transaction(function () use ($payment, $registration, $event, $grossAmount, $feePercent, $platformFeeAmount, $communityNetAmount, $community) {
            $platformFee = PlatformFee::create([
                'event_id' => $event->id,
                'event_registration_id' => $registration->id,
                'event_payment_confirmation_id' => $payment->id,
                'gross_amount' => $grossAmount,
                'platform_fee_amount' => $platformFeeAmount,
                'community_net_amount' => $communityNetAmount,
                'platform_fee_percent' => $feePercent,
                'status' => 'recorded',
            ]);

            if ($community && $community->owner) {
                $this->walletService->credit(
                    $community->owner,
                    $communityNetAmount,
                    "Pendapatan event: {$event->title} (net setelah platform fee {$feePercent}%)",
                    'event_income',
                    $event
                );
            }

            return $platformFee;
        });
    }

    public function getPlatformRevenue(): float
    {
        return (float) PlatformFee::sum('platform_fee_amount');
    }

    public function getCommunityNetIncome(int $communityId): float
    {
        return (float) PlatformFee::whereHas('event', function ($q) use ($communityId) {
            $q->where('community_id', $communityId);
        })->sum('community_net_amount');
    }

    public function getTotalGrossIncome(): float
    {
        return (float) PlatformFee::sum('gross_amount');
    }

    public function getFeeReport(int $perPage = 20)
    {
        return PlatformFee::with('event.community', 'registration.user', 'paymentConfirmation')
            ->latest()
            ->paginate($perPage);
    }

    public function getCommunityFeeReport(int $communityId, int $perPage = 20)
    {
        return PlatformFee::whereHas('event', function ($q) use ($communityId) {
            $q->where('community_id', $communityId);
        })
            ->with('event', 'registration.user')
            ->latest()
            ->paginate($perPage);
    }

    public function getStatsByMonth(): array
    {
        return PlatformFee::selectRaw('
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                SUM(gross_amount) as total_gross,
                SUM(platform_fee_amount) as total_fee,
                SUM(community_net_amount) as total_net,
                COUNT(*) as total_transactions
            ')
            ->groupBy('year', 'month')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->limit(12)
            ->get()
            ->toArray();
    }
}
