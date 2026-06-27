<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyCronToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('app.cron_secret') ?: env('CRON_SECRET');

        if (empty($expected)) {
            return response()->json(['error' => 'Cron secret not configured.'], 503);
        }

        $provided = $request->query('token') ?? $request->bearerToken();

        if (!is_string($provided) || !hash_equals((string) $expected, $provided)) {
            return response()->json(['error' => 'Invalid cron token.'], 403);
        }

        return $next($request);
    }
}
