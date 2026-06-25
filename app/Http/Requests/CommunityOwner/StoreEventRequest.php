<?php

namespace App\Http\Requests\CommunityOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'community_id' => ['required', 'exists:communities,id'],
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type_id' => ['nullable', 'exists:event_types,id'],
            'banner_path' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'event_type' => ['required', 'in:free,paid,collaboration,volunteer,charity'],
            'location_type' => ['required', 'in:online,offline,hybrid'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'location_address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'online_url' => ['nullable', 'string', 'max:500'],
            'start_datetime' => ['required', 'date'],
            'end_datetime' => ['nullable', 'date', 'after_or_equal:start_datetime'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'registration_type' => ['required', 'in:open,approval_required,invite_only'],
            'registration_status' => ['required', 'in:open,closed'],
            'visibility' => ['required', 'in:public,private'],
            'status' => ['nullable', 'in:draft,published'],
            'is_charity' => ['sometimes', 'boolean'],
            'is_open_volunteer' => ['sometimes', 'boolean'],
            'is_open_donation' => ['sometimes', 'boolean'],
            'discount_enabled' => ['sometimes', 'boolean'],
            'discount_type' => ['required_if:discount_enabled,true', 'nullable', 'in:percentage,fixed'],
            'discount_value' => ['required_if:discount_enabled,true', 'nullable', 'numeric', 'min:0'],
            'eo_by_platform' => ['sometimes', 'boolean'],
        ];

        if ($this->input('event_type') === 'paid') {
            $rules['price'] = ['required', 'numeric', 'min:0'];
            $rules['platform_fee'] = ['nullable', 'numeric', 'min:0'];
            $rules['admin_fee'] = ['nullable', 'numeric', 'min:0'];
        }

        if ($this->input('eo_by_platform')) {
            $rules['eo_fee'] = ['required', 'numeric', 'min:0'];
        }

        return $rules;
    }
}
