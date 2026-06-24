<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Donation;
use App\Services\WalletService;
use App\Services\PlatformFeeService;
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

        if ($member) {
            $walletService->credit($member, 250000, 'Welcome bonus', 'manual_adjustment');
            $walletService->credit($member, 50000, 'Reward event participation', 'manual_adjustment');
            $walletService->debit($member, 15000, 'Event registration fee', 'manual_adjustment');

            Donation::create([
                'donor_id' => $member->id,
                'donation_type' => 'community_donation',
                'amount' => 50000,
                'message' => 'Semangat untuk komunitas!',
                'status' => 'confirmed',
                'community_id' => \App\Models\Community::first()?->id,
                'confirmed_at' => now()->subDays(2),
            ]);

            Donation::create([
                'donor_id' => $member->id,
                'donation_type' => 'event_donation',
                'amount' => 25000,
                'message' => 'Semoga event-nya sukses',
                'status' => 'pending',
                'event_id' => \App\Models\Event::first()?->id,
                'community_id' => \App\Models\Event::first()?->community_id,
            ]);
        }

        if ($communityOwner) {
            $walletService->credit($communityOwner, 500000, 'Initial community fund', 'manual_adjustment');
            $walletService->credit($communityOwner, 150000, 'Event income: Laravel Workshop', 'event_income');

            Donation::create([
                'donor_id' => $member?->id ?? $communityOwner->id,
                'donation_type' => 'community_donation',
                'amount' => 100000,
                'message' => 'Donasi untuk pengembangan komunitas',
                'status' => 'pending',
                'community_id' => \App\Models\Community::where('owner_id', $communityOwner->id)->first()?->id,
            ]);
        }

        if ($brandOwner) {
            $walletService->credit($brandOwner, 1000000, 'CSR budget allocation', 'manual_adjustment');
        }

        $this->command->info('Dummy wallet transactions seeder completed.');
    }
}
