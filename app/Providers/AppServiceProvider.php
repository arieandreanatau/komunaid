<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Brand;
use App\Models\CollaborationRequest;
use App\Models\Community;
use App\Models\Company;
use App\Models\ContactSetting;
use App\Models\DocumentationFile;
use App\Models\Event;
use App\Models\HomepageSection;
use App\Models\Suggestion;
use App\Policies\BrandPolicy;
use App\Policies\CmsPolicy;
use App\Policies\CollaborationRequestPolicy;
use App\Policies\CommunityPolicy;
use App\Policies\CompanyPolicy;
use App\Policies\DocumentationPolicy;
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
        Gate::policy(Company::class, CompanyPolicy::class);

        Gate::policy(Blog::class, CmsPolicy::class);
        Gate::policy(HomepageSection::class, CmsPolicy::class);
        Gate::policy(ContactSetting::class, CmsPolicy::class);
        Gate::policy(Suggestion::class, CmsPolicy::class);

        Gate::policy(DocumentationFile::class, DocumentationPolicy::class);
    }
}
