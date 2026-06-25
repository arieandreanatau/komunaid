<?php

namespace App\Support\Helpers;

use Carbon\Carbon;
use Illuminate\Support\Number;

class FormatHelper
{
    public static function currency(?float $amount, string $code = 'IDR'): string
    {
        if ($amount === null) {
            return '-';
        }
        return $code . ' ' . Number::format($amount, 0);
    }

    public static function date(?Carbon $date, string $format = 'd M Y'): string
    {
        if (!$date) {
            return '-';
        }
        return $date->translatedFormat($format);
    }

    public static function datetime(?Carbon $date, string $format = 'd M Y H:i'): string
    {
        if (!$date) {
            return '-';
        }
        return $date->translatedFormat($format);
    }

    public static function relative(?Carbon $date): string
    {
        if (!$date) {
            return '-';
        }
        return $date->diffForHumans();
    }

    public static function truncate(?string $text, int $limit = 100, string $end = '...'): string
    {
        if ($text === null) {
            return '';
        }
        return \Illuminate\Support\Str::limit($text, $limit, $end);
    }

    public static function roleLabel(string $role): string
    {
        return match ($role) {
            'superadmin' => 'Superadmin',
            'admin_platform' => 'Admin Platform',
            'member' => 'Member',
            'community_owner' => 'Community Owner',
            'community_pengurus' => 'Community Pengurus',
            'community_volunteer' => 'Community Volunteer',
            'brand_owner' => 'Brand Owner',
            'company_owner' => 'Company Owner',
            'event_volunteer' => 'Event Volunteer',
            default => ucwords(str_replace('_', ' ', $role)),
        };
    }

    public static function statusBadgeClass(string $status): string
    {
        return match (strtolower($status)) {
            'active', 'published', 'approved', 'accepted', 'completed', 'ongoing' => 'bg-green-100 text-green-800',
            'pending', 'pending_payment', 'review', 'sent', 'draft', 'trial' => 'bg-yellow-100 text-yellow-800',
            'banned', 'rejected', 'cancelled', 'suspended', 'expired', 'archived' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
}
