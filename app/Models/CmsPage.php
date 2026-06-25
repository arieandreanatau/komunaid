<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'title',
        'content',
        'meta',
        'is_published',
        'key',
        'meta_title',
        'meta_description',
        'status',
        'language_code',
        'created_by',
        'updated_by',
        'published_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'key';
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->orWhere('is_published', true);
    }

    public function scopeLanguage($query, string $locale)
    {
        return $query->where('language_code', $locale);
    }

    public function scopeByKey($query, string $key)
    {
        return $query->where('key', $key);
    }
}
