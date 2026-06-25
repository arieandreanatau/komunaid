<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoginLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_or_username',
        'ip_address',
        'user_agent',
        'success',
        'logged_in_at',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'logged_in_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
