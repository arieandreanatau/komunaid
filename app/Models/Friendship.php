<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Friendship extends Model
{
    use HasFactory;

    protected $fillable = ['requester_id', 'addressee_id', 'status', 'requested_at', 'responded_at'];

    protected $casts = [
        'requested_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function addressee()
    {
        return $this->belongsTo(User::class, 'addressee_id');
    }
}
