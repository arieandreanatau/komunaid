<?php

namespace Database\Seeders\Master;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Donation;
use App\Services\Finance\WalletService;
use App\Services\Finance\PlatformFeeService;
use App\Models\EventPaymentConfirmation;
use Illuminate\Database\Seeder;

class WalletTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $walletService = app(WalletService::class);

        $member = User::where('email', 'member@komuna.id')->first();
        $communityOwner = User::where('email', 'community@komuna.id')->first();
        $brandOwner = User::where('email', 'brand@komuna.id')->first();

        $creditIfMissing = function (User $user, float $amount, string $description, ?string $category = null) use ($walletService): void {
            $exists = \App\Models\WalletTransaction::where('description', $description)
                ->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id))
                ->exists();
            if (!$exists) {
                $walletService->credit($user, $amount, $description, $category);
            }
        };

        $debitIfMissing = function (User $user, float $amount, string $description, ?string $category = null) use ($walletService): void {
            $exists = \App\Models\WalletTransaction::where('description', $description)
                ->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id))
                ->exists();
            if (!$exists) {
                $walletService->debit($user, $amount, $description, $category);
            }
        };

        if ($member) {
            $creditIfMissing($member, 250000, 'Welcome bonus', 'manual_adjustment');
            $creditIfMissing($member, 50000, 'Reward event participation', 'manual_adjustment');
            $debitIfMissing($member, 15000, 'Event registration fee', 'manual_adjustment');
            // Wallet credits (idempotency enforced at the service layer)
            $walletService->credit($member, 250000, 'Welcome bonus', 'manual_adjustment');
            $walletService->credit($member, 50000, 'Reward event participation', 'manual_adjustment');
            $walletService->debit($member, 15000, 'Event registration fee', 'manual_adjustment');

            Donation::firstOrCreate(
                [
                    'donor_id' => $member->id,
                    'donation_type' => 'community_donation',
                    'message' => 'Semangat untuk komunitas!',
                ],
                [
                    'amount' => 50000,
                    'status' => 'confirmed',
                    'community_id' => \App\Models\Community::first()?->id,
                    'confirmed_at' => now()->subDays(2),
                ]
            );

            Donation::firstOrCreate(
                [
                    'donor_id' => $member->id,
                    'donation_type' => 'event_donation',
                    'message' => 'Semoga event-nya sukses',
                ],
                [
                    'amount' => 25000,
                    'status' => 'pending',
                    'event_id' => \App\Models\Event::first()?->id,
                    'community_id' => \App\Models\Event::first()?->community_id,
                ]
            );
        }

        if ($communityOwner) {
            $creditIfMissing($communityOwner, 500000, 'Initial community fund', 'manual_adjustment');
            $creditIfMissing($communityOwner, 150000, 'Event income: Laravel Workshop', 'event_income');

            Donation::firstOrCreate(
                [
                    'donor_id' => $member?->id ?? $communityOwner->id,
                    'donation_type' => 'community_donation',
                    'message' => 'Donasi untuk pengembangan komunitas',
                ],
                [
                    'amount' => 100000,
                    'status' => 'pending',
                    'community_id' => \App\Models\Community::where('owner_id', $communityOwner->id)->first()?->id,
                ]
            );
        }

        if ($brandOwner) {
            $creditIfMissing($brandOwner, 1000000, 'CSR budget allocation', 'manual_adjustment');
        }

        $this->command->info('Dummy wallet transactions seeder completed.');
    }
}
