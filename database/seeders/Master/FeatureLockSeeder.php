<?php

namespace Database\Seeders\Master;

use App\Models\FeatureLock;
use Illuminate\Database\Seeder;

class FeatureLockSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            ['feature_key' => 'export_community_members', 'feature_name' => 'Export Community Members', 'is_premium' => true],
            ['feature_key' => 'export_event_participants', 'feature_name' => 'Export Event Participants', 'is_premium' => true],
            ['feature_key' => 'advanced_community_analytics', 'feature_name' => 'Advanced Community Analytics', 'is_premium' => true],
            ['feature_key' => 'advanced_event_analytics', 'feature_name' => 'Advanced Event Analytics', 'is_premium' => true],
            ['feature_key' => 'custom_community_page', 'feature_name' => 'Custom Community Page', 'is_premium' => true],
            ['feature_key' => 'featured_community', 'feature_name' => 'Featured Community', 'is_premium' => true],
            ['feature_key' => 'featured_event', 'feature_name' => 'Featured Event', 'is_premium' => true],
            ['feature_key' => 'featured_brand', 'feature_name' => 'Featured Brand', 'is_premium' => true],
            ['feature_key' => 'multi_admin_permission', 'feature_name' => 'Multi Admin Permission', 'is_premium' => true],
            ['feature_key' => 'event_finance_report', 'feature_name' => 'Event Finance Report', 'is_premium' => true],
            ['feature_key' => 'donation_report', 'feature_name' => 'Donation Report', 'is_premium' => true],
            ['feature_key' => 'collaboration_pipeline', 'feature_name' => 'Collaboration Pipeline', 'is_premium' => true],
            ['feature_key' => 'company_multi_brand', 'feature_name' => 'Company Multi Brand', 'is_premium' => true],
            ['feature_key' => 'bulk_notification', 'feature_name' => 'Bulk Notification', 'is_premium' => true],
            ['feature_key' => 'verification_badge', 'feature_name' => 'Verification Badge', 'is_premium' => true],
            ['feature_key' => 'qr_attendance', 'feature_name' => 'QR Attendance', 'is_premium' => true],
            ['feature_key' => 'certificate_generator', 'feature_name' => 'Certificate Generator', 'is_premium' => true],
        ];

        foreach ($features as $feature) {
            FeatureLock::updateOrCreate(
                ['feature_key' => $feature['feature_key']],
                $feature
            );
        }
    }
}
