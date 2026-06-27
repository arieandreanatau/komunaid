<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply the locale stored in the session (if any) to the application.
 * Attached to the `web` middleware group in bootstrap/app.php so the
 * locale is honored on every request.
 */
class ApplySessionLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['id', 'en'];
        $locale = $request->session()->get('locale');

        if (is_string($locale) && in_array($locale, $supported, true)) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
