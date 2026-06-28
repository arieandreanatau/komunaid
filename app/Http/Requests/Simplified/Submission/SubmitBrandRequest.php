<?php

declare(strict_types=1);

namespace App\Http\Requests\Simplified\Submission;

use Illuminate\Foundation\Http\FormRequest;

class SubmitBrandRequest extends FormRequest
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
            'brand_name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'brand_description' => ['required', 'string', 'min:30'],
            'industry' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'company_relation' => ['required', 'in:independent,under_existing_company,will_create_company_later'],
            'company_id' => ['required_if:company_relation,under_existing_company', 'nullable', 'integer', 'exists:companies,id'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'brand_name.required' => 'Nama brand wajib diisi.',
            'brand_name.unique' => 'Nama brand sudah dipakai.',
            'brand_description.required' => 'Deskripsi brand wajib diisi.',
            'brand_description.min' => 'Deskripsi brand minimal 30 karakter.',
            'company_relation.required' => 'Relasi perusahaan wajib dipilih.',
            'company_relation.in' => 'Relasi perusahaan tidak valid.',
            'company_id.required_if' => 'Pilih perusahaan yang sudah ada.',
            'website.url' => 'Website harus URL valid.',
        ];
    }
}
