<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id', 'name', 'slug', 'legal_name', 'industry', 'description',
        'logo_path', 'website_url', 'email', 'phone', 'address', 'city',
        'province', 'status', 'approved_by', 'approved_at', 'rejection_reason',
        'revision_notes', 'submitted_at', 'tax_number', 'is_verified',
        'created_by', 'updated_by',
    ];

    protected $casts = ['is_verified' => 'boolean'];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($company) {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function brands()
    {
        return $this->hasMany(Brand::class);
    }

    public function members()
    {
        return $this->hasMany(CompanyBrandMember::class);
    }

    public function collaborationProposalsAsProposer()
    {
        return $this->hasMany(CollaborationProposal::class, 'proposer_id')
            ->where('proposer_type', 'company');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspendedOrBanned(): bool
    {
        return in_array($this->status, ['suspended', 'banned']);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
              ->orWhere('slug', 'like', "%{$keyword}%")
              ->orWhere('legal_name', 'like', "%{$keyword}%")
              ->orWhere('industry', 'like', "%{$keyword}%");
        });
    }
}
