<?php

namespace App\Providers;

use App\Models\Brand;
use App\Models\CollaborationRequest;
use App\Models\Community;
use App\Models\Event;
use App\Policies\BrandPolicy;
use App\Policies\CollaborationRequestPolicy;
use App\Policies\CommunityPolicy;
use App\Policies\EventPolicy;
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
        Gate::policy(Brand::class, BrandPolicy::class);
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(CollaborationRequest::class, CollaborationRequestPolicy::class);
    }
}
