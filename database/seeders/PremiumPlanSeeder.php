<?php

namespace Database\Seeders;

use App\Models\PremiumPlan;
use Illuminate\Database\Seeder;

class PremiumPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'KomunaID Trial',
                'slug' => 'komunaid-trial',
                'description' => 'Trial gratis selama 14 hari untuk menjelajahi fitur premium KomunaID.',
                'price' => 0,
                'billing_cycle' => 'trial',
                'features' => [
                    'Export Community Members',
                    'Export Event Participants',
                    'Advanced Analytics',
                    'Custom Community Page',
                    'Featured Community',
                    'Featured Event',
                    'Collaboration Pipeline',
                    'Event Finance Report',
                    'Donation Report',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Community Growth Plan',
                'slug' => 'community-growth',
                'description' => 'Paket premium untuk komunitas yang ingin tumbuh dan berkembang.',
                'price' => 99000,
                'billing_cycle' => 'monthly',
                'features' => [
                    'Export Community Members',
                    'Export Event Participants',
                    'Advanced Community Analytics',
                    'Custom Community Page',
                    'Featured Community',
                    'Featured Event',
                    'Multi Admin Permission',
                    'Event Finance Report',
                    'Donation Report',
                    'Bulk Notification',
                    'Verification Badge',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Brand Collaboration Plan',
                'slug' => 'brand-collaboration',
                'description' => 'Paket premium untuk brand dan perusahaan yang ingin berkolaborasi dengan komunitas.',
                'price' => 199000,
                'billing_cycle' => 'monthly',
                'features' => [
                    'Export Community Members',
                    'Export Event Participants',
                    'Advanced Community Analytics',
                    'Advanced Event Analytics',
                    'Custom Community Page',
                    'Featured Community',
                    'Featured Event',
                    'Featured Brand',
                    'Multi Admin Permission',
                    'Collaboration Pipeline',
                    'Event Finance Report',
                    'Donation Report',
                    'Company Multi Brand',
                    'Bulk Notification',
                    'Verification Badge',
                    'QR Attendance',
                    'Certificate Generator',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            PremiumPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
