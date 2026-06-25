<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSuggestionRequest;
use App\Models\Suggestion;

class PublicSuggestionController extends Controller
{
    public function store(StoreSuggestionRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        if (auth()->check()) {
            $data['name'] = $data['name'] ?? auth()->user()->name;
            $data['email'] = $data['email'] ?? auth()->user()->email;
        }

        $data['status'] = 'new';

        Suggestion::create($data);

        return redirect()->route('contact')
            ->with('success', 'Terima kasih, saran kamu sudah kami terima.');
    }
}
