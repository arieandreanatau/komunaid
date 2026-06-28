<?php

namespace Database\Seeders;

use Database\Seeders\Master\CmsPageSeeder;
use Database\Seeders\Master\CollaborationTypeSeeder;
use Database\Seeders\Master\CommunityCategorySeeder;
use Database\Seeders\Master\CommunityOwnerSeeder;
use Database\Seeders\Master\CommunitySeeder;
use Database\Seeders\Master\ContactSettingSeeder;
use Database\Seeders\Master\EventTypeSeeder;
use Database\Seeders\Master\FeatureLockSeeder;
use Database\Seeders\Master\HomepageSectionSeeder;
use Database\Seeders\Master\InterestSeeder;
use Database\Seeders\Master\PremiumPlanSeeder;
use Database\Seeders\Master\RegionSeeder;
use Database\Seeders\Master\RoleSeeder;
use Database\Seeders\Master\SuperadminSeeder;
use Database\Seeders\Master\WalletTransactionSeeder;
use Database\Seeders\Demo\DemoAdminChatSeeder;
use Database\Seeders\Demo\DemoBrandCompanySeeder;
use Database\Seeders\Demo\DemoCmsContentSeeder;
use Database\Seeders\Demo\DemoCollaborationSeeder;
use Database\Seeders\Demo\DemoCommunitySeeder;
use Database\Seeders\Demo\DemoEventSeeder;
use Database\Seeders\Demo\DemoExtraDataSeeder;
use Database\Seeders\Demo\DemoPremiumTrialSeeder;
use Database\Seeders\Demo\DemoUserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SuperadminSeeder::class,
            CommunityCategorySeeder::class,
            InterestSeeder::class,
            RegionSeeder::class,
            EventTypeSeeder::class,
            CollaborationTypeSeeder::class,
            ContactSettingSeeder::class,
            FeatureLockSeeder::class,
            PremiumPlanSeeder::class,
            CmsPageSeeder::class,
            HomepageSectionSeeder::class,
        ]);

        // Optional master seeders (only run if their class file exists)
        $optionalMaster = [
            \Database\Seeders\Master\CommunityOwnerSeeder::class,
            \Database\Seeders\Master\CommunitySeeder::class,
            \Database\Seeders\Master\WalletTransactionSeeder::class,
        ];
        foreach ($optionalMaster as $seeder) {
            if (class_exists($seeder)) {
                $this->call($seeder);
            }
        }

        if (app()->environment('local') || config('app.debug')) {
            $this->call([
                DemoUserSeeder::class,
                DemoCommunitySeeder::class,
                DemoEventSeeder::class,
                DemoBrandCompanySeeder::class,
                DemoCollaborationSeeder::class,
                DemoPremiumTrialSeeder::class,
                DemoCmsContentSeeder::class,
                DemoAdminChatSeeder::class,
                DemoExtraDataSeeder::class,
            ]);
        }
    }
}
