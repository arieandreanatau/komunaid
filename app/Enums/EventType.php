<?php

namespace App\Enums;

enum EventType: string
{
    case FREE = 'free';
    case PAID = 'paid';
    case COLLABORATION = 'collaboration';
    case VOLUNTEER = 'volunteer';
    case CHARITY = 'charity';

    public function label(): string
    {
        return match ($this) {
            self::FREE => 'Free',
            self::PAID => 'Paid',
            self::COLLABORATION => 'Collaboration',
            self::VOLUNTEER => 'Volunteer',
            self::CHARITY => 'Charity',
        };
    }
}
