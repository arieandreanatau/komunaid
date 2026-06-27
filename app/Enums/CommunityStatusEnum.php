<?php

namespace App\Enums;

enum CommunityStatusEnum: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Banned = 'banned';
    case Suspended = 'suspended';
    case Archived = 'archived';

    public function isPubliclyVisible(): bool
    {
        return $this === self::Active;
    }
}
