<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'avatar',
        'status',
        'last_login_at',
        'last_login_ip',
        'banned_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function loginLogs()
    {
        return $this->hasMany(LoginLog::class);
    }

    public function roleRequests()
    {
        return $this->hasMany(RoleRequest::class);
    }

    public function hasPendingRoleRequest(string $requestedRole): bool
    {
        return $this->roleRequests()
            ->where('requested_role', $requestedRole)
            ->where('status', 'pending')
            ->exists();
    }

    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'interest_user');
    }

    public function isBannedOrSuspended(): bool
    {
        return $this->banned_at !== null
            || in_array($this->status, ['suspended', 'banned']);
    }

    public function getDashboardRoute(): string
    {
        if ($this->isBannedOrSuspended()) {
            return route('account.restricted');
        }

        $redirectService = app(\App\Services\Auth\RedirectByRoleService::class);
        return $redirectService->getRedirectPath($this);
    }

    public function ownedCommunities()
    {
        return $this->hasMany(Community::class, 'owner_id');
    }

    public function communityMemberships()
    {
        return $this->hasMany(CommunityMember::class);
    }

    public function joinedCommunities()
    {
        return $this->belongsToMany(Community::class, 'community_members')
            ->wherePivot('status', 'active')
            ->withTimestamps();
    }

    public function joinHistories()
    {
        return $this->hasMany(MemberJoinHistory::class);
    }

    public function isCommunityBanned(Community $community): bool
    {
        return $this->communityMemberships()
            ->where('community_id', $community->id)
            ->where('status', 'banned')
            ->exists();
    }

    public function canJoinCommunity(Community $community): array
    {
        if ($this->isCommunityBanned($community)) {
            return ['allowed' => false, 'reason' => 'Anda telah dibanned dari komunitas ini.'];
        }

        if ($this->isMember($community)) {
            return ['allowed' => false, 'reason' => 'Anda sudah menjadi anggota komunitas ini.'];
        }

        if ($this->isJoinDisabled($community)) {
            return ['allowed' => false, 'reason' => 'Join disabled selama 1 bulan karena telah keluar masuk 3x.'];
        }

        if ($community->max_members && $community->activeMembers()->count() >= $community->max_members) {
            return ['allowed' => false, 'reason' => 'Komunitas sudah penuh.'];
        }

        return ['allowed' => true, 'reason' => null];
    }

    public function isMember(Community $community): bool
    {
        return $this->communityMemberships()
            ->where('community_id', $community->id)
            ->where('status', 'active')
            ->exists();
    }

    public function isJoinDisabled(Community $community): bool
    {
        $joinCount = $this->joinHistories()
            ->where('community_id', $community->id)
            ->whereIn('action', ['joined', 'left'])
            ->count();

        if ($joinCount >= 6) {
            $lastHistory = $this->joinHistories()
                ->where('community_id', $community->id)
                ->orderByDesc('acted_at')
                ->first();

            if ($lastHistory && $lastHistory->acted_at->diffInDays(now()) < 30) {
                return true;
            }
        }

        return false;
    }

    public function ownedBrands()
    {
        return $this->hasMany(Brand::class, 'owner_id');
    }

    public function brandMemberships()
    {
        return $this->hasMany(BrandMember::class);
    }

    public function ownedCampaigns()
    {
        return $this->hasMany(Campaign::class, 'created_by');
    }

    public function sentCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class, 'created_by');
    }

    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function registeredEvents()
    {
        return $this->belongsToMany(Event::class, 'event_registrations')
            ->withPivot('status', 'payment_status')
            ->withTimestamps();
    }

    public function uploadedGalleries()
    {
        return $this->hasMany(EventGallery::class, 'uploaded_by');
    }

    public function eventVolunteerApplications()
    {
        return $this->hasMany(EventVolunteerApplication::class);
    }

    public function eventVolunteers()
    {
        return $this->hasMany(EventVolunteer::class);
    }

    public function eventDonations()
    {
        return $this->hasMany(EventDonation::class, 'donor_user_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'donor_id');
    }

    public function ownedEvents()
    {
        return $this->hasManyThrough(Event::class, Community::class, 'owner_id', 'community_id');
    }

    public function ownedCompanies()
    {
        return $this->hasMany(Company::class, 'owner_id');
    }

    public function sentFriendships()
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function receivedFriendships()
    {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }

    public function memberGalleries()
    {
        return $this->hasMany(MemberGallery::class);
    }

    public function memberHistories()
    {
        return $this->hasMany(MemberHistory::class);
    }

    public function customNotifications()
    {
        return $this->hasMany(CustomNotification::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function featureUsages()
    {
        return $this->hasMany(FeatureUsage::class);
    }

    public function communityBookmarks()
    {
        return $this->hasMany(CommunityBookmark::class);
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class);
    }

    public function adminConversationParticipants()
    {
        return $this->hasMany(AdminConversationParticipant::class);
    }

    public function adminConversations()
    {
        return $this->belongsToMany(AdminConversation::class, 'admin_conversation_participants', 'user_id', 'conversation_id')
            ->withTimestamps();
    }

    public function adminMessages()
    {
        return $this->hasMany(AdminMessage::class, 'sender_id');
    }
}
