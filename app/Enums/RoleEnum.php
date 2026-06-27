<?php

namespace App\Enums;

enum RoleEnum: string
{
    case Superadmin = 'superadmin';
    case AdminPlatform = 'admin_platform';
    case Member = 'member';
    case CommunityOwner = 'community_owner';
    case CommunityPengurus = 'community_pengurus';
    case CommunityVolunteer = 'community_volunteer';
    case BrandOwner = 'brand_owner';
    case CompanyOwner = 'company_owner';
    case EventVolunteer = 'event_volunteer';

    public static function all(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }

    public static function ownerRoles(): array
    {
        return [
            self::CommunityOwner->value,
            self::BrandOwner->value,
            self::CompanyOwner->value,
        ];
    }
}
