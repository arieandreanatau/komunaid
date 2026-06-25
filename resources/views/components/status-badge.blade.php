@props(['status' => 'active'])

@php
    $styles = match($status) {
        'active', 'approved', 'confirmed', 'paid', 'completed', 'published', 'verified', 'accepted' => 'bg-komuna-success-soft text-komuna-success',
        'pending', 'waiting', 'new', 'sent', 'trialing' => 'bg-komuna-warning-soft text-komuna-warning',
        'inactive', 'archived', 'draft', 'expired' => 'bg-komuna-border-soft text-komuna-muted',
        'banned', 'cancelled', 'rejected', 'failed', 'suspended' => 'bg-komuna-danger-soft text-komuna-danger',
        'free' => 'bg-komuna-light text-komuna-blue',
        'premium' => 'bg-purple-50 text-purple-600',
        'open' => 'bg-komuna-info-soft text-komuna-info',
        'closed' => 'bg-komuna-border-soft text-komuna-muted',
        'reviewed' => 'bg-komuna-info-soft text-komuna-info',
        default => 'bg-komuna-border-soft text-komuna-muted',
    };

    $labels = [
        'active' => 'Active',
        'approved' => 'Approved',
        'confirmed' => 'Confirmed',
        'paid' => 'Paid',
        'completed' => 'Completed',
        'published' => 'Published',
        'verified' => 'Verified',
        'accepted' => 'Accepted',
        'pending' => 'Pending',
        'waiting' => 'Waiting',
        'new' => 'New',
        'sent' => 'Sent',
        'trialing' => 'Trial',
        'inactive' => 'Inactive',
        'archived' => 'Archived',
        'draft' => 'Draft',
        'expired' => 'Expired',
        'banned' => 'Banned',
        'cancelled' => 'Cancelled',
        'rejected' => 'Rejected',
        'failed' => 'Failed',
        'suspended' => 'Suspended',
        'free' => 'Free',
        'premium' => 'Premium',
        'open' => 'Open',
        'closed' => 'Closed',
        'reviewed' => 'Reviewed',
    ];

    $label = $labels[$status] ?? ucfirst($status);
@endphp

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $styles }}">
    {{ $label }}
</span>
