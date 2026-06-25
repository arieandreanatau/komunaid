<?php

namespace Database\Seeders;

use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DemoPremiumTrialSeeder extends Seeder
{
    public function run(): void
    {
        $trialPlan = PremiumPlan::where('slug', 'komunaid-trial')->first();
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();
        $brandOwner = User::where('email', 'brand.owner@komuna.test')->first();
        $companyOwner = User::where('email', 'company.owner@komuna.test')->first();

        if (!$trialPlan) {
            $this->command->warn('PremiumPlanSeeder must run first. Skipping DemoPremiumTrialSeeder.');
            return;
        }

        if ($communityOwner) {
            Subscription::updateOrCreate(
                ['user_id' => $communityOwner->id, 'plan_id' => $trialPlan->id],
                [
                    'status' => 'trialing',
                    'starts_at' => Carbon::now()->subDays(3),
                    'trial_ends_at' => Carbon::now()->addDays(11),
                    'created_by' => null,
                ]
            );
        }

        if ($brandOwner) {
            Subscription::updateOrCreate(
                ['user_id' => $brandOwner->id, 'plan_id' => $trialPlan->id],
                [
                    'status' => 'expired',
                    'starts_at' => Carbon::now()->subDays(20),
                    'trial_ends_at' => Carbon::now()->subDays(6),
                    'cancelled_at' => Carbon::now()->subDays(6),
                    'created_by' => null,
                ]
            );
        }

        if ($companyOwner) {
            Subscription::updateOrCreate(
                ['user_id' => $companyOwner->id, 'plan_id' => $trialPlan->id],
                [
                    'status' => 'trialing',
                    'starts_at' => Carbon::now()->subDays(1),
                    'trial_ends_at' => Carbon::now()->addDays(13),
                    'created_by' => null,
                ]
            );
        }
    }
}
