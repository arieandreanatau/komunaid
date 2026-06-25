<?php

namespace App\Http\Requests\CompanyOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandUnderCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['company_owner', 'superadmin']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'website_url' => 'nullable|string|max:500',
            'instagram_url' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30',
            'industry' => 'nullable|string|max:100',
        ];
    }
}
