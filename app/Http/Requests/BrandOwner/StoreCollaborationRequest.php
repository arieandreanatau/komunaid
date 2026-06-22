<?php

namespace App\Http\Requests\BrandOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreCollaborationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('brand_owner');
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'exists:brands,id'],
            'community_id' => ['required', 'exists:communities,id'],
            'collaboration_type' => ['required', 'in:free_collaboration,paid_collaboration,sponsorship,csr_donation,tap_in_event'],
            'title' => ['required', 'string', 'max:255'],
            'proposal' => ['nullable', 'string', 'max:10000'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'event_date' => ['nullable', 'date'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
