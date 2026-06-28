<?php

declare(strict_types=1);

namespace App\Services\Simplified\Auth;

use App\Models\Profile;
use App\Models\User;
use App\Services\Simplified\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RegisterMemberService
{
    public function __construct(private AuditLogService $audit) {}

    public function register(array $data, ?Request $request = null): User
    {
        return DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'status' => 'active',
                'default_role' => 'member',
                'onboarding_completed' => true,
            ]);

            Profile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'username' => $data['username'],
                    'display_name' => $data['name'],
                ]
            );

            $role = Role::where('name', 'member')->first();
            if ($role && ! $user->hasRole('member')) {
                $user->assignRole($role);
            }

            $this->audit->log(
                actorId: $user->id,
                action: 'user_registered',
                subject: $user,
                newValues: ['email' => $user->email, 'username' => $user->username],
                description: 'Member registered',
                request: $request,
            );

            return $user;
        });
    }

    public function autoLogin(User $user, ?Request $request = null): void
    {
        Auth::login($user);

        if ($request) {
            $request->session()->regenerate();
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request?->ip(),
        ]);
    }
}
