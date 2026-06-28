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
        'short_description',
        'logo',
        'banner',
        'logo_path',
        'banner_path',
        'region',
        'city',
        'province',
        'country',
        'address',
        'website',
        'contact_email',
        'contact_phone',
        'instagram',
        'instagram_url',
        'website_url',
        'social_media',
        'community_type',
        'location_type',
        'visibility',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'revision_notes',
        'submitted_at',
        'is_public',
        'max_members',
        'member_count',
        'is_recommended',
        'is_featured',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'max_members' => 'integer',
        'member_count' => 'integer',
        'is_recommended' => 'boolean',
        'is_featured' => 'boolean',
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

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
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

    public function internalRoles()
    {
        return $this->hasMany(CommunityInternalRole::class);
    }

    public function managements()
    {
        return $this->hasMany(CommunityManagement::class);
    }

    public function volunteers()
    {
        return $this->hasMany(CommunityVolunteer::class);
    }

    public function ownershipTransfers()
    {
        return $this->hasMany(CommunityOwnershipTransfer::class);
    }

    public function campaigns()
    {
        return $this->hasMany(CommunityCampaign::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(CommunityBookmark::class);
    }

    public function collaborationProposalsAsTarget()
    {
        return $this->hasMany(CollaborationProposal::class, 'target_id')
            ->where('target_type', 'community');
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

    public function scopePublicApproved($query)
    {
        return $query->where('status', 'approved')
            ->where('is_public', true);
    }

    public function scopeRecommended($query)
    {
        return $query->where(function ($q) {
            $q->where('is_recommended', true)
                ->orWhere('is_featured', true);
        });
    }
}
