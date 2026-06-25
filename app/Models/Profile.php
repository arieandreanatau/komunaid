<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'display_name',
        'bio',
        'phone',
        'city',
        'province',
        'country',
        'address',
        'profile_photo',
        'interest',
        'date_of_birth',
        'gender',
        'social_links',
        'skills',
        'cover_photo',
        'instagram_url',
        'linkedin_url',
        'website_url',
        'privacy',
    ];

    protected $casts = [
        'social_links' => 'array',
        'skills' => 'array',
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
