<?php

namespace App\Http\Requests\CommunityOwner;

use Illuminate\Foundation\Http\FormRequest;

class RejectCollaborationProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['community_owner', 'superadmin']);
    }

    public function rules(): array
    {
        return [
            'response_note' => 'required|string|max:1000',
        ];
    }
}
