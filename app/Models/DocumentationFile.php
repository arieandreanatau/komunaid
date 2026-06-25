<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentationFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'document_key',
        'document_type',
        'format',
        'file_path',
        'status',
        'generated_by',
        'generated_at',
        'summary',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'generated_at' => 'datetime',
    ];

    public function generatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function scopeGenerated($query)
    {
        return $query->where('status', 'generated');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('document_type', $type);
    }

    public function scopeByFormat($query, string $format)
    {
        return $query->where('format', $format);
    }

    public function scopeSearch($query, string $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
                ->orWhere('document_key', 'like', "%{$keyword}%")
                ->orWhere('summary', 'like', "%{$keyword}%");
        });
    }

    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'generated' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Generated</span>',
            'failed' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Failed</span>',
            'draft' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Draft</span>',
            default => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Unknown</span>',
        };
    }
}
