<?php

declare(strict_types=1);

namespace App\Services\Simplified\Auth;

use App\Models\LoginLog;
use App\Models\User;
use App\Services\Simplified\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginService
{
    public function __construct(private AuditLogService $audit) {}

    public function authenticate(string $login, string $password, bool $remember, ?Request $request = null): array
    {
        $user = User::where('email', $login)->orWhere('username', $login)->first();

        if (! $user) {
            LoginLog::create([
                'user_id' => null,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
                'success' => false,
            ]);
            return ['ok' => false, 'message' => 'Email/username atau password salah.'];
        }

        if (! Hash::check($password, $user->password)) {
            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
                'success' => false,
            ]);
            return ['ok' => false, 'message' => 'Email/username atau password salah.'];
        }

        if ($user->isBannedOrSuspended()) {
            Auth::login($user);
            $request?->session()->regenerate();
            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
                'success' => false,
            ]);
            Auth::logout();
            $request?->session()->invalidate();
            $request?->session()->regenerateToken();
            return ['ok' => false, 'message' => 'Akun kamu sedang dinonaktifkan. Hubungi admin KomunaID.', 'suspended' => true];
        }

        Auth::login($user, $remember);
        $request?->session()->regenerate();

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request?->ip(),
        ]);

        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'success' => true,
        ]);

        $this->audit->log(
            actorId: $user->id,
            action: 'user_logged_in',
            subject: $user,
            request: $request,
        );

        return ['ok' => true, 'user' => $user];
    }
}
