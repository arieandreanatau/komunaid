<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventRegistration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'payment_status',
        'notes',
        'registered_at',
        'approved_by',
        'approved_at',
        'cancelled_at',
        'attendance_at',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'attendance_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentConfirmation()
    {
        return $this->hasOne(EventPaymentConfirmation::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isWaitingConfirmation(): bool
    {
        return $this->payment_status === 'waiting_confirmation';
    }

    public function canCancel(): bool
    {
        if ($this->status === 'cancelled') {
            return false;
        }
        if ($this->status === 'attended') {
            return false;
        }
        if ($this->event && $this->event->start_datetime && $this->event->start_datetime->isPast()) {
            return false;
        }
        return true;
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isAttended(): bool
    {
        return $this->status === 'attended';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'registered')->orWhere('status', 'approved');
    }

    public function scopeAttended($query)
    {
        return $query->where('status', 'attended');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
