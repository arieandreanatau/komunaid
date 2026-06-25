<?php

namespace App\Support\Enums;

enum CollaborationStatusEnum: string
{
    case Draft = 'draft';
    case Sent = 'sent';
    case Review = 'review';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case Archived = 'archived';

    public function isTerminal(): bool
    {
        return in_array($this, [
            self::Accepted, self::Rejected, self::Cancelled, self::Completed, self::Archived
        ], true);
    }
}
