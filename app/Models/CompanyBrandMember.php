<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyBrandMember extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'brand_id', 'user_id', 'role', 'status',
        'invited_by', 'joined_at',
    ];

    protected $casts = ['joined_at' => 'datetime'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
