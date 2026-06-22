<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPERADMIN = 'superadmin';
    case MEMBER = 'member';
    case COMMUNITY_OWNER = 'community_owner';
    case BRAND_OWNER = 'brand_owner';
    case COMMUNITY_STAFF = 'community_staff';
    case BRAND_STAFF = 'brand_staff';

    public function label(): string
    {
        return match ($this) {
            self::SUPERADMIN => 'Superadmin',
            self::MEMBER => 'Member',
            self::COMMUNITY_OWNER => 'Community Owner',
            self::BRAND_OWNER => 'Brand Owner',
            self::COMMUNITY_STAFF => 'Community Staff',
            self::BRAND_STAFF => 'Brand Staff',
        };
    }
}
