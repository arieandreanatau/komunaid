<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_registration_id',
        'event_payment_confirmation_id',
        'gross_amount',
        'platform_fee_amount',
        'community_net_amount',
        'platform_fee_percent',
        'status',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'platform_fee_amount' => 'decimal:2',
        'community_net_amount' => 'decimal:2',
        'platform_fee_percent' => 'decimal:2',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class, 'event_registration_id');
    }

    public function paymentConfirmation()
    {
        return $this->belongsTo(EventPaymentConfirmation::class, 'event_payment_confirmation_id');
    }

    public function scopeRecorded($query)
    {
        return $query->where('status', 'recorded');
    }

    public function getFormattedGrossAttribute(): string
    {
        return 'Rp ' . number_format($this->gross_amount, 0, ',', '.');
    }

    public function getFormattedFeeAttribute(): string
    {
        return 'Rp ' . number_format($this->platform_fee_amount, 0, ',', '.');
    }

    public function getFormattedNetAttribute(): string
    {
        return 'Rp ' . number_format($this->community_net_amount, 0, ',', '.');
    }
}
