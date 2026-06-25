<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable',
            'status' => 'required|in:draft,published,archived',
            'language_code' => 'required|in:id,en,su',
        ];
    }
}
