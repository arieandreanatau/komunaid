<?php

namespace App\Enums;

enum FeatureKeyEnum: string
{
    case AdvancedAnalytics = 'advanced_analytics';
    case CustomBranding = 'custom_branding';
    case UnlimitedCommunities = 'unlimited_communities';
    case UnlimitedEvents = 'unlimited_events';
    case BulkExport = 'bulk_export';
    case PrioritySupport = 'priority_support';
    case ApiAccess = 'api_access';

    public static function all(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }
}
