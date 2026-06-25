<?php

namespace App\Http\Controllers\Superadmin\Cms;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use Illuminate\Http\Request;

class SuperadminSuggestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Suggestion::with('user', 'reviewer');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $suggestions = $query->latest()->paginate(15)->withQueryString();

        return view('superadmin.cms.suggestions.index', compact('suggestions'));
    }

    public function show(Suggestion $suggestion)
    {
        $suggestion->load('user', 'reviewer');
        return view('superadmin.cms.suggestions.show', compact('suggestion'));
    }

    public function markReviewed(Suggestion $suggestion)
    {
        $suggestion->update([
            'status' => 'reviewed',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->route('superadmin.cms.suggestions.show', $suggestion)
            ->with('success', 'Saran ditandai sudah ditinjau.');
    }

    public function archive(Suggestion $suggestion)
    {
        $suggestion->update([
            'status' => 'archived',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->route('superadmin.cms.suggestions.index')
            ->with('success', 'Saran berhasil diarsipkan.');
    }
}
