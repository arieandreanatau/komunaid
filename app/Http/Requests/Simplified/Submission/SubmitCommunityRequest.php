<?php

declare(strict_types=1);

namespace App\Http\Requests\Simplified\Submission;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCommunityRequest extends FormRequest
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
            'community_name' => ['required', 'string', 'max:255', 'unique:communities,name'],
            'category_id' => ['required', 'integer', 'exists:community_categories,id'],
            'description' => ['required', 'string', 'min:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'province' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'social_media' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'community_name.required' => 'Nama komunitas wajib diisi.',
            'community_name.unique' => 'Nama komunitas sudah dipakai.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak valid.',
            'description.required' => 'Deskripsi wajib diisi.',
            'description.min' => 'Deskripsi minimal 30 karakter.',
            'logo.image' => 'Logo harus berupa gambar.',
            'logo.mimes' => 'Logo harus berformat jpg/png/webp.',
            'logo.max' => 'Logo maksimal 2MB.',
            'banner.image' => 'Banner harus berupa gambar.',
            'banner.mimes' => 'Banner harus berformat jpg/png/webp.',
            'banner.max' => 'Banner maksimal 4MB.',
        ];
    }
}
