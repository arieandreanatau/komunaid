<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'payment_status',
        'notes',
        'registered_at',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
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
        if ($this->event && $this->event->start_datetime && $this->event->start_datetime->isPast()) {
            return false;
        }
        return true;
    }
}
