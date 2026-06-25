<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contacts' => 'required|array',
            'contacts.*.key' => 'required|string|max:100',
            'contacts.*.label' => 'nullable|string|max:255',
            'contacts.*.value' => 'nullable|string|max:500',
            'contacts.*.url' => 'nullable|string|max:500',
            'contacts.*.icon' => 'nullable|string|max:100',
            'contacts.*.is_active' => 'boolean',
            'contacts.*.sort_order' => 'nullable|integer',
        ];
    }
}
