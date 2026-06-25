<?php

namespace App\Services\Premium;

use App\Models\FeatureLock;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Enums\FeatureKeyEnum;
use App\Support\Enums\SubscriptionStatusEnum;
use Illuminate\Support\Facades\Cache;

class PremiumAccessService
{
    public function isLocked(User $user, string $featureKey): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_platform'])) {
            return false;
        }

        $cacheKey = "feature_lock:{$featureKey}";

        $lock = Cache::rememberForever($cacheKey, function () use ($featureKey) {
            return FeatureLock::where('feature_key', $featureKey)->first();
        });

        if (!$lock) {
            return false;
        }

        if (!$lock->is_enabled) {
            return true;
        }

        if (!$lock->is_premium) {
            return false;
        }

        $hasActiveSubscription = Subscription::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [SubscriptionStatusEnum::Active->value, SubscriptionStatusEnum::Trial->value])
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->exists();

        return !$hasActiveSubscription;
    }

    public function isLockedByEnum(User $user, FeatureKeyEnum $feature): bool
    {
        return $this->isLocked($user, $feature->value);
    }

    public function flushCache(?string $featureKey = null): void
    {
        if ($featureKey) {
            Cache::forget("feature_lock:{$featureKey}");
            return;
        }

        foreach (FeatureKeyEnum::cases() as $case) {
            Cache::forget("feature_lock:{$case->value}");
        }
        Cache::forget('feature_lock:*');
    }
}
