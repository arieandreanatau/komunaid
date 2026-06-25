<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HomepageSection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'key',
        'title',
        'subtitle',
        'content',
        'image_path',
        'button_text',
        'button_url',
        'sort_order',
        'is_active',
        'language_code',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::addGlobalScope('ordered', function ($query) {
            $query->orderBy('sort_order');
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLanguage($query, string $locale)
    {
        return $query->where('language_code', $locale);
    }
}
