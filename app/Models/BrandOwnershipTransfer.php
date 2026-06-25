<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class BrandOwnershipTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id', 'old_owner_id', 'new_owner_id', 'transferred_by',
        'reason', 'transferred_at', 'status',
    ];

    protected $casts = ['transferred_at' => 'datetime'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function oldOwner()
    {
        return $this->belongsTo(User::class, 'old_owner_id');
    }

    public function newOwner()
    {
        return $this->belongsTo(User::class, 'new_owner_id');
    }

    public function transferredByUser()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
