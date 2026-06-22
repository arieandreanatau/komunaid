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
        'title',
        'slug',
        'description',
        'event_type',
        'location_type',
        'location_address',
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
        'approval_status',
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
}
