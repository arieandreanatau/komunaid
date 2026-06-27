<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RouteNamingTest extends TestCase
{
    public function test_no_duplicate_route_names(): void
    {
        $names = collect(Route::getRoutes())
            ->map(fn ($r) => $r->getName())
            ->filter()
            ->values();

        $duplicates = $names->duplicates();

        $this->assertCount(
            0,
            $duplicates,
            'Duplicate route names found: ' . $duplicates->implode(', ')
        );
    }

    public function test_all_parameterless_named_routes_resolve_via_route_helper(): void
    {
        $routes = collect(Route::getRoutes())
            ->filter(fn ($r) => $r->getName() !== null)
            ->unique(fn ($r) => $r->getName())
            ->values();

        foreach ($routes as $route) {
            $name = $route->getName();
            $uri = $route->uri();
            // Skip routes with required parameters
            if (preg_match('/\{[^?}]+\}/', $uri) && !str_contains($uri, '?')) {
                continue;
            }
            $url = route($name);
            $this->assertIsString($url, "Route [{$name}] did not resolve to a string URL.");
            $this->assertNotEmpty($url, "Route [{$name}] resolved to an empty URL.");
        }
    }

    public function test_route_modules_split_files_exist(): void
    {
        $expected = [
            'public', 'auth', 'member',
            'community-owner', 'brand-owner', 'company-owner', 'superadmin',
        ];

        foreach ($expected as $name) {
            $this->assertFileExists(
                base_path("routes/modules/{$name}.php"),
                "Route module file routes/modules/{$name}.php is missing."
            );
        }
    }

    public function test_cron_route_is_token_protected(): void
    {
        $route = collect(Route::getRoutes())
            ->first(fn ($r) => $r->getName() === 'cron.scheduler');

        $this->assertNotNull($route, 'Route [cron.scheduler] not registered.');
        $this->assertContains(
            'cron.token',
            $route->gatherMiddleware(),
            'Route [cron.scheduler] must be protected by cron.token middleware.'
        );
    }
}
