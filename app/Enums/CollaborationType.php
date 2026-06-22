<?php

namespace App\Enums;

enum CollaborationType: string
{
    case FREE = 'free_collaboration';
    case PAID = 'paid_collaboration';
    case SPONSORSHIP = 'sponsorship';
    case CSR_DONATION = 'csr_donation';
    case TAP_IN_EVENT = 'tap_in_event';

    public function label(): string
    {
        return match ($this) {
            self::FREE => 'Free Collaboration',
            self::PAID => 'Paid Collaboration',
            self::SPONSORSHIP => 'Sponsorship',
            self::CSR_DONATION => 'CSR Donation',
            self::TAP_IN_EVENT => 'Tap-in Event',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::FREE => 'emerald',
            self::PAID => 'blue',
            self::SPONSORSHIP => 'purple',
            self::CSR_DONATION => 'orange',
            self::TAP_IN_EVENT => 'teal',
        };
    }
}
