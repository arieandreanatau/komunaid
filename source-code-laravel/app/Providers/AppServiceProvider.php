<?php

namespace App\Providers;

use App\Models\Community;
use App\Policies\CommunityPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Community::class, CommunityPolicy::class);
    }
}
