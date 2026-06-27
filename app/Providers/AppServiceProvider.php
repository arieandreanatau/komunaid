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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

        $this->assertProductionConfig();
    }

    /**
     * Guard against deploying the production build with development defaults.
     * Fails fast on Vercel if the operator forgot to set external services.
     */
    private function assertProductionConfig(): void
    {
        if (!$this->app->environment('production')) {
            return;
        }

        $issues = [];

        if (config('database.default') === 'sqlite') {
            $issues[] = 'DB_CONNECTION must not be sqlite in production (data is not persistent on Vercel).';
        }

        if (config('cache.default') === 'file' && getenv('VERCEL')) {
            $issues[] = 'CACHE_STORE must not be file on Vercel (cold start wipes it). Use redis.';
        }

        if (config('session.driver') === 'file' && getenv('VERCEL')) {
            $issues[] = 'SESSION_DRIVER must not be file on Vercel (sessions lost on cold start). Use redis or database.';
        }

        if (config('queue.default') === 'sync' && getenv('VERCEL')) {
            // Sync is fine for low-volume request-scoped jobs, but warn.
            // We don't fail because sync works for short event finance jobs.
        }

        if (config('filesystems.default') === 'local' && getenv('VERCEL')) {
            $issues[] = 'FILESYSTEM_DISK must not be local on Vercel (uploads lost on cold start). Use s3 or r2.';
        }

        if (!empty($issues)) {
            // Log loud but don't crash on every request – use the exception handler once.
            if (!$this->app->hasBeenBootstrapped() || PHP_SAPI === 'cli') {
                foreach ($issues as $issue) {
                    fwrite(STDERR, "[KomunaID] PRODUCTION CONFIG: $issue\n");
                }
            } else {
                // Surface in storage/logs as a one-time-per-process marker
                try {
                    Storage::disk('local')->put('production-config-warnings.log', implode("\n", $issues) . "\n");
                } catch (\Throwable $e) {
                    // Storage may be read-only on Vercel outside /tmp. Silently skip.
                }
            }
        }
    }
}
