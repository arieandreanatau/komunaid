<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $blogId = $this->route('blog')?->id ?? $this->route('blog');

        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,' . $blogId,
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
