<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventFinanceSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'total_income', 'total_expense', 'balance', 'last_calculated_at',
    ];

    protected $casts = [
        'total_income' => 'decimal:2',
        'total_expense' => 'decimal:2',
        'balance' => 'decimal:2',
        'last_calculated_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
