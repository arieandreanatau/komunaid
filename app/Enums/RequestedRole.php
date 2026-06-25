<?php

namespace App\Enums;

enum RequestedRole: string
{
    case COMMUNITY_OWNER = 'community_owner';
    case BRAND_OWNER = 'brand_owner';
    case COMPANY_OWNER = 'company_owner';

    public function label(): string
    {
        return match ($this) {
            self::COMMUNITY_OWNER => 'Community Owner',
            self::BRAND_OWNER => 'Brand Owner',
            self::COMPANY_OWNER => 'Company Owner',
        };
    }

    public static function publicRequestable(): array
    {
        return array_column(self::cases(), 'value');
    }
}
