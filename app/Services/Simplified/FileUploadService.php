<?php

declare(strict_types=1);

namespace App\Services\Simplified;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    public function upload(Request $request, string $field, string $folder): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }
        $file = $request->file($field);
        if (! $file instanceof UploadedFile || ! $file->isValid()) {
            return null;
        }
        $name = Str::lower(Str::random(20)).'.'.$file->getClientOriginalExtension();
        return $file->storeAs($folder, $name, 'public');
    }
}
