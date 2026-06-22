<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
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
        ];
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
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

    public function getDashboardRoute(): string
    {
        if ($this->hasRole('superadmin')) {
            return route('superadmin.dashboard');
        }
        if ($this->hasRole('community_owner')) {
            return route('community.dashboard');
        }
        if ($this->hasRole('brand_owner')) {
            return route('brand.dashboard');
        }
        return route('member.dashboard');
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

    public function ownedEvents()
    {
        return $this->hasManyThrough(Event::class, Community::class, 'owner_id', 'community_id');
    }
}
