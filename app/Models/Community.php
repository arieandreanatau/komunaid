<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Community extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'owner_id',
        'name',
        'slug',
        'description',
        'about',
        'logo',
        'banner',
        'region',
        'city',
        'website',
        'contact_email',
        'instagram',
        'social_media',
        'community_type',
        'visibility',
        'status',
        'is_public',
        'max_members',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'max_members' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($community) {
            if (empty($community->slug)) {
                $community->slug = Str::slug($community->name);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(CommunityCategory::class, 'category_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(CommunityMember::class);
    }

    public function activeMembers()
    {
        return $this->members()->where('status', 'active');
    }

    public function pendingMembers()
    {
        return $this->members()->where('status', 'pending');
    }

    public function bannedMembers()
    {
        return $this->members()->where('status', 'banned');
    }

    public function joinHistories()
    {
        return $this->hasMany(MemberJoinHistory::class);
    }

    public function regions()
    {
        return $this->hasMany(CommunityRegion::class);
    }

    public function subgroups()
    {
        return $this->hasMany(CommunitySubgroup::class);
    }

    public function bans()
    {
        return $this->hasMany(CommunityBan::class);
    }

    public function memberRoles()
    {
        return $this->hasMany(CommunityMemberRole::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function incomingCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class, 'community_id');
    }

    public function sentCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class, 'sender_community_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function getMembersCountAttribute(): int
    {
        return $this->activeMembers()->count();
    }

    public function isMember(User $user): bool
    {
        return $this->members()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();
    }

    public function isBanned(User $user): bool
    {
        return $this->members()
            ->where('user_id', $user->id)
            ->where('status', 'banned')
            ->exists();
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isClosed(): bool
    {
        return $this->community_type === 'closed';
    }

    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }
}
