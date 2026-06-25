<?php

namespace App\Services\Auth;

use App\Models\User;

class RedirectByRoleService
{
    public function getRedirectPath(User $user): string
    {
        if ($user->banned_at) {
            return route('account.restricted');
        }

        if ($user->status === 'suspended' || $user->status === 'banned') {
            return route('account.restricted');
        }

        if ($user->hasRole('superadmin')) {
            return route('superadmin.dashboard');
        }

        if ($user->hasRole('platform_admin')) {
            return route('superadmin.dashboard');
        }

        if ($user->hasRole('company_owner')) {
            return route('company-owner.dashboard');
        }

        if ($user->hasRole('brand_owner') || $user->hasRole('brand_staff')) {
            return route('brand.dashboard');
        }

        if ($user->hasRole('community_owner')) {
            return route('community.dashboard');
        }

        if ($user->hasRole('community_admin') || $user->hasRole('community_staff')) {
            return route('member.dashboard');
        }

        if ($user->hasRole('community_volunteer')) {
            return route('member.dashboard');
        }

        if ($user->hasRole('event_volunteer')) {
            return route('member.dashboard');
        }

        if ($user->hasRole('member')) {
            return route('member.dashboard');
        }

        return route('onboarding');
    }
}
