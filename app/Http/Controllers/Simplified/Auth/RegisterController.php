<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simplified\Auth\RegisterRequest;
use App\Services\Simplified\Auth\RegisterMemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisterController extends Controller
{
    public function __construct(private RegisterMemberService $service) {}

    public function create(): View
    {
        if (Auth::check()) {
            return redirect()->route('simplified.dashboard');
        }
        return view('simplified.auth.register');
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = $this->service->register($request->validated(), $request);

        Auth::login($user);
        $request->session()->regenerate();

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        return redirect()->route('simplified.dashboard')
            ->with('success', 'Selamat datang di KomunaID! Akun kamu berhasil dibuat.');
    }
}
