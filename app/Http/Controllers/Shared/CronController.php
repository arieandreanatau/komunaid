<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class CronController extends Controller
{
    public function run(): JsonResponse
    {
        try {
            Artisan::call('schedule:run');
            $output = Artisan::output();
            Log::info('cron.scheduler.run', ['output' => $output]);
            return response()->json([
                'ok' => true,
                'ran_at' => now()->toIso8601String(),
                'output' => $output,
            ]);
        } catch (\Throwable $e) {
            Log::error('cron.scheduler.error', ['message' => $e->getMessage()]);
            return response()->json([
                'ok' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
