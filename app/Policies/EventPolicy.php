<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'community_owner']);
    }

    public function view(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('community_owner');
    }

    public function update(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function delete(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageRegistrations(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageGalleries(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageChats(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function approveEvent(User $user, Event $event): bool
    {
        return $user->hasRole('superadmin');
    }

    public function publish(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function cancel(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function archive(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageVolunteerCampaign(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageVolunteerApplications(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageVolunteers(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageDonations(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }

    public function manageFinance(User $user, Event $event): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $user->id === $event->community->owner_id;
    }
}
