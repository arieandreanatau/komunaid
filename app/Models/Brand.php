<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'company_id',
        'name',
        'slug',
        'description',
        'logo_path',
        'website_url',
        'instagram_url',
        'email',
        'phone',
        'industry',
        'status',
        'is_verified',
        'is_featured',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_verified' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = Str::slug($brand->name);
            }
            $brand->slug = $brand->ensureUniqueSlug($brand->slug);
        });
        static::updating(function ($brand) {
            if ($brand->isDirty('name') && !$brand->isDirty('slug')) {
                $brand->slug = Str::slug($brand->name);
            }
            if ($brand->isDirty('slug')) {
                $brand->slug = $brand->ensureUniqueSlug($brand->slug);
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function members()
    {
        return $this->hasMany(BrandMember::class);
    }

    public function activeMembers()
    {
        return $this->members()->where('status', 'active');
    }

    public function companyBrandMembers()
    {
        return $this->hasMany(CompanyBrandMember::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function ownershipTransfers()
    {
        return $this->hasMany(BrandOwnershipTransfer::class);
    }

    public function collaborationProposalsAsProposer()
    {
        return $this->hasMany(CollaborationProposal::class, 'proposer_id')
            ->where('proposer_type', 'brand');
    }

    public function collaborationProposalsAsTarget()
    {
        return $this->hasMany(CollaborationProposal::class, 'target_id')
            ->where('target_type', 'brand');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspendedOrBanned(): bool
    {
        return in_array($this->status, ['suspended', 'banned']);
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
              ->orWhere('industry', 'like', "%{$keyword}%")
              ->orWhere('description', 'like', "%{$keyword}%");
        });
    }

    protected function ensureUniqueSlug($slug)
    {
        $originalSlug = $slug;
        $counter = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        return $slug;
    }
}
