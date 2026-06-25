<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'translatable_type', 'translatable_id', 'field', 'language_code', 'value',
    ];

    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }
}
