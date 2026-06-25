<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'community_id',
        'created_by',
        'title',
        'slug',
        'description',
        'short_description',
        'banner_path',
        'type_id',
        'event_type',
        'location_type',
        'location_address',
        'location_name',
        'city',
        'province',
        'online_url',
        'start_datetime',
        'end_datetime',
        'capacity',
        'price',
        'platform_fee',
        'admin_fee',
        'discount_enabled',
        'discount_type',
        'discount_value',
        'registration_status',
        'registration_type',
        'approval_status',
        'status',
        'is_charity',
        'is_open_volunteer',
        'is_open_donation',
        'is_featured',
        'eo_by_platform',
        'eo_fee',
        'visibility',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'capacity' => 'integer',
        'price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'discount_enabled' => 'boolean',
        'discount_value' => 'decimal:2',
        'eo_by_platform' => 'boolean',
        'eo_fee' => 'decimal:2',
        'is_charity' => 'boolean',
        'is_open_volunteer' => 'boolean',
        'is_open_donation' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function type()
    {
        return $this->belongsTo(EventType::class, 'type_id');
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function activeRegistrations()
    {
        return $this->registrations()->where('status', 'registered');
    }

    public function galleries()
    {
        return $this->hasMany(EventGallery::class);
    }

    public function chats()
    {
        return $this->hasMany(EventChat::class);
    }

    public function volunteerCampaigns()
    {
        return $this->hasMany(EventVolunteerCampaign::class);
    }

    public function volunteers()
    {
        return $this->hasMany(EventVolunteer::class);
    }

    public function donations()
    {
        return $this->hasMany(EventDonation::class);
    }

    public function financeTransactions()
    {
        return $this->hasMany(EventFinanceTransaction::class);
    }

    public function financeSummary()
    {
        return $this->hasOne(EventFinanceSummary::class);
    }

    public function isPaid(): bool
    {
        return $this->event_type === 'paid';
    }

    public function isFree(): bool
    {
        return $this->event_type === 'free';
    }

    public function isCollaboration(): bool
    {
        return $this->event_type === 'collaboration';
    }

    public function isVolunteer(): bool
    {
        return $this->event_type === 'volunteer';
    }

    public function isCharity(): bool
    {
        return $this->event_type === 'charity';
    }

    public function isOpenForRegistration(): bool
    {
        return $this->registration_status === 'open' && $this->approval_status === 'approved';
    }

    public function isFull(): bool
    {
        if (!$this->capacity) {
            return false;
        }
        return $this->activeRegistrations()->count() >= $this->capacity;
    }

    public function getRemainingCapacityAttribute(): ?int
    {
        if (!$this->capacity) {
            return null;
        }
        return max(0, $this->capacity - $this->activeRegistrations()->count());
    }

    public function getDiscountedPriceAttribute(): float
    {
        if (!$this->discount_enabled || !$this->discount_value) {
            return (float) $this->price;
        }
        if ($this->discount_type === 'percentage') {
            return (float) $this->price - ((float) $this->price * (float) $this->discount_value / 100);
        }
        return (float) $this->price - (float) $this->discount_value;
    }

    public function isOwnedByCommunity(Community $community): bool
    {
        return $this->community_id === $community->id;
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isOpenForVolunteer(): bool
    {
        return $this->is_open_volunteer && $this->isPublished();
    }

    public function isOpenForDonation(): bool
    {
        return $this->is_open_donation && $this->isPublished();
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>', now());
    }

    public function scopePublic($query)
    {
        return $query->where('status', 'published')->where('visibility', 'public');
    }

    public function scopeOwnedByCommunityOwner($query, int $userId)
    {
        return $query->whereIn('community_id', Community::where('owner_id', $userId)->pluck('id'));
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) {
            return $query;
        }
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('description', 'like', "%{$keyword}%");
        });
    }
}
