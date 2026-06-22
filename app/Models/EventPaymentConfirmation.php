<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventPaymentConfirmation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_registration_id',
        'proof_image',
        'amount_paid',
        'bank_name',
        'account_name',
        'status',
        'admin_notes',
        'confirmed_at',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'confirmed_at' => 'datetime',
    ];

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class, 'event_registration_id');
    }
}
