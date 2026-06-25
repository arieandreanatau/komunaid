<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPERADMIN = 'superadmin';
    case PLATFORM_ADMIN = 'platform_admin';
    case MEMBER = 'member';
    case COMMUNITY_OWNER = 'community_owner';
    case COMMUNITY_ADMIN = 'community_admin';
    case COMMUNITY_VOLUNTEER = 'community_volunteer';
    case BRAND_OWNER = 'brand_owner';
    case COMPANY_OWNER = 'company_owner';
    case COMMUNITY_STAFF = 'community_staff';
    case BRAND_STAFF = 'brand_staff';

    public function label(): string
    {
        return match ($this) {
            self::SUPERADMIN => 'Superadmin',
            self::PLATFORM_ADMIN => 'Platform Admin',
            self::MEMBER => 'Member',
            self::COMMUNITY_OWNER => 'Community Owner',
            self::COMMUNITY_ADMIN => 'Community Admin',
            self::COMMUNITY_VOLUNTEER => 'Community Volunteer',
            self::BRAND_OWNER => 'Brand Owner',
            self::COMPANY_OWNER => 'Company Owner',
            self::COMMUNITY_STAFF => 'Community Staff',
            self::BRAND_STAFF => 'Brand Staff',
        };
    }
}
