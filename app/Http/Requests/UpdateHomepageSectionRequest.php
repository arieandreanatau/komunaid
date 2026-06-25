<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sectionId = $this->route('section')?->id ?? $this->route('section');

        return [
            'key' => 'required|string|max:100|unique:homepage_sections,key,' . $sectionId,
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'language_code' => 'required|in:id,en,su',
        ];
    }
}
