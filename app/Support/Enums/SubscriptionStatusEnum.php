<?php

namespace App\Support\Enums;

enum SubscriptionStatusEnum: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
    case Trial = 'trial';
    case PendingPayment = 'pending_payment';

    public function isActive(): bool
    {
        return in_array($this, [self::Active, self::Trial], true);
    }
}
