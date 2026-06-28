<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simplified\Auth\LoginRequest;
use App\Services\Simplified\Auth\LoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function __construct(private LoginService $service) {}

    public function create(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('simplified.dashboard');
        }
        return view('simplified.auth.login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $result = $this->service->authenticate(
            login: (string) $request->input('login'),
            password: (string) $request->input('password'),
            remember: $request->boolean('remember'),
            request: $request,
        );

        if (! $result['ok']) {
            if (! empty($result['suspended'])) {
                return redirect()->route('account.restricted')
                    ->with('warning', $result['message']);
            }
            return back()->withErrors(['login' => $result['message']])->onlyInput('login');
        }

        return redirect()->intended(route('simplified.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('simplified.login');
    }
}
