<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdminConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'participant_ids' => ['required', 'array', 'min:1'],
            'participant_ids.*' => ['required', 'integer', 'exists:users,id'],
            'first_message' => 'required|string|min:1|max:5000',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $participantIds = $this->input('participant_ids', []);

            if (!empty($participantIds)) {
                $users = \App\Models\User::whereIn('id', $participantIds)->get();

                foreach ($users as $user) {
                    if ($user->isBannedOrSuspended()) {
                        $validator->errors()->add(
                            'participant_ids',
                            "User {$user->name} tidak bisa ditambahkan karena akun dibanned/ditangguhkan."
                        );
                        break;
                    }

                    if (!$user->hasRole('superadmin') && !$user->hasRole('platform_admin')) {
                        $validator->errors()->add(
                            'participant_ids',
                            "User {$user->name} bukan admin platform."
                        );
                        break;
                    }
                }

                $duplicateIds = array_diff_key($participantIds, array_unique($participantIds));
                if (!empty($duplicateIds)) {
                    $validator->errors()->add('participant_ids', 'Terdapat peserta duplikat.');
                }
            }
        });
    }
}
