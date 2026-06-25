<?php

namespace Database\Seeders;

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
