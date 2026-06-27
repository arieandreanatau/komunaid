<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Behind Vercel's proxy: trust X-Forwarded-* so generated URLs use https.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'admin' => \App\Http\Middleware\EnsureSuperadmin::class,
            'not.superadmin' => \App\Http\Middleware\EnsureNotSuperadmin::class,
            'active_user' => \App\Http\Middleware\ActiveUser::class,
            'not.banned' => \App\Http\Middleware\EnsureNotBanned::class,
            'cron.token' => \App\Http\Middleware\VerifyCronToken::class,
        ]);

        $middleware->redirectGuestsTo(function () {
            if (request()->is('admin/*') || request()->is('admin') || request()->is('superadmin/*') || request()->is('superadmin')) {
                return route('admin.login');
            }
            return route('login');
        });

        $middleware->redirectUsersTo(function () {
            if (auth()->check() && auth()->user()->hasRole('superadmin')) {
                return route('superadmin.dashboard');
            }
            return route('member.dashboard');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
