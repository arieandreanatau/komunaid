# KomunaID — Enums & Constants

## UserRole Enum

```php
<?php

namespace App\Enums;

enum UserRole: string
{
    case MEMBER = 'member';
    case COMMUNITY_OWNER = 'community_owner';
    case BRAND_OWNER = 'brand_owner';
    case SUPERADMIN = 'superadmin';

    public function label(): string
    {
        return match($this) {
            self::MEMBER => 'Member',
            self::COMMUNITY_OWNER => 'Community Owner',
            self::BRAND_OWNER => 'Brand Owner',
            self::SUPERADMIN => 'Superadmin',
        };
    }
}
```

## ApprovalStatus Enum

```php
<?php

namespace App\Enums;

enum ApprovalStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'warning',
            self::APPROVED => 'success',
            self::REJECTED => 'danger',
        };
    }
}
```

## CommunityMemberRole Enum

```php
<?php

namespace App\Enums;

enum CommunityMemberRole: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';

    public function label(): string
    {
        return match($this) {
            self::OWNER => 'Owner',
            self::ADMIN => 'Admin',
            self::MEMBER => 'Member',
        };
    }
}
```

## EventAttendeeStatus Enum

```php
<?php

namespace App\Enums;

enum EventAttendeeStatus: string
{
    case GOING = 'going';
    case MAYBE = 'maybe';
    case NOT_GOING = 'not_going';

    public function label(): string
    {
        return match($this) {
            self::GOING => 'Going',
            self::MAYBE => 'Maybe',
            self::NOT_GOING => 'Not Going',
        };
    }
}
```
