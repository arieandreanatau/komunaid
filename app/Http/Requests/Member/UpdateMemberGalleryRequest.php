<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberGalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'caption' => ['nullable', 'string', 'max:500'],
            'community_id' => ['nullable', 'exists:communities,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'activity_date' => ['nullable', 'date'],
            'visibility' => ['required', 'in:public,friends,private'],
        ];
    }
}
