<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\RedirectByRoleService;

class DashboardRedirectController extends Controller
{
    public function __invoke()
    {
        $user = auth()->user();
        $redirectService = app(RedirectByRoleService::class);

        return redirect($redirectService->getRedirectPath($user));
    }
}
