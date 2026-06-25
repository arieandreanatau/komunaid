<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\UpdateInterestRequest;
use App\Models\Interest;
use App\Models\MemberHistory;

class InterestController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $interests = Interest::where('is_active', true)->get();
        $selectedInterestIds = $user->interests()->pluck('interests.id')->toArray();

        return view('member.interests.index', compact('interests', 'selectedInterestIds'));
    }

    public function update(UpdateInterestRequest $request)
    {
        $user = auth()->user();

        try {
            $user->interests()->sync($request->input('interests', []));

            $interestNames = Interest::whereIn('id', $request->input('interests', []))->pluck('name')->implode(', ');

            MemberHistory::create([
                'user_id' => $user->id,
                'type' => 'interest_updated',
                'title' => 'Minat diperbarui',
                'description' => 'Minat diperbarui: ' . ($interestNames ?: 'Tidak ada'),
                'metadata' => ['interests' => $request->input('interests', [])],
            ]);

            return redirect()->route('member.interests.index')->with('success', 'Minat berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->route('member.interests.index')->with('error', 'Gagal memperbarui minat: ' . $e->getMessage());
        }
    }
}
