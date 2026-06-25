<?php

namespace App\Support\Enums;

enum EventStatusEnum: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Ongoing = 'ongoing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Archived = 'archived';

    public function isPubliclyVisible(): bool
    {
        return in_array($this, [self::Published, self::Ongoing, self::Completed], true);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled, self::Archived], true);
    }
}
