<?php

namespace App\Enums;

enum RequestedRole: string
{
    case COMMUNITY_OWNER = 'community_owner';
    case BRAND_OWNER = 'brand_owner';

    public function label(): string
    {
        return match ($this) {
            self::COMMUNITY_OWNER => 'Community Owner',
            self::BRAND_OWNER => 'Brand Owner',
        };
    }
}
