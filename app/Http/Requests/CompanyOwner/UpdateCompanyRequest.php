<?php

namespace App\Http\Requests\CompanyOwner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['company_owner', 'superadmin']);
    }

    public function rules(): array
    {
        $companyId = $this->route('company')?->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:companies,slug,' . $companyId,
            'legal_name' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'website_url' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
        ];
    }
}
