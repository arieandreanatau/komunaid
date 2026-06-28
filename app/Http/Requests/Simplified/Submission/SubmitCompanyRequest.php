<?php

declare(strict_types=1);

namespace App\Http\Requests\Simplified\Submission;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && $this->user()->status === 'active'
            && ! $this->user()->isBannedOrSuspended();
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255', 'unique:companies,name'],
            'description' => ['required', 'string', 'min:30'],
            'industry' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'Nama perusahaan wajib diisi.',
            'company_name.unique' => 'Nama perusahaan sudah dipakai.',
            'description.required' => 'Deskripsi wajib diisi.',
            'description.min' => 'Deskripsi minimal 30 karakter.',
            'website.url' => 'Website harus URL valid.',
        ];
    }
}
