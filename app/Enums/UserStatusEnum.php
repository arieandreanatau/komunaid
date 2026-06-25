<?php

namespace App\Enums;

enum UserStatusEnum: string
{
    case Active = 'active';
    case Banned = 'banned';
    case Suspended = 'suspended';

    public function isAccessible(): bool
    {
        return $this === self::Active;
    }

    public function isBlocked(): bool
    {
        return in_array($this, [self::Banned, self::Suspended], true);
    }
}
