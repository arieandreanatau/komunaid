<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberHistory;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = MemberHistory::where('user_id', auth()->id())->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $histories = $query->paginate(20);

        return view('member.history.index', compact('histories'));
    }

    public static function safeMemberHistory(
        int $userId,
        string $type,
        string $title,
        string $description = null,
        $reference = null,
        array $metadata = null
    ): ?MemberHistory {
        try {
            $data = [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'description' => $description,
            ];

            if ($reference) {
                $data['reference_type'] = get_class($reference);
                $data['reference_id'] = $reference->getKey();
            }

            if ($metadata) {
                $data['metadata'] = $metadata;
            }

            return MemberHistory::create($data);
        } catch (\Exception $e) {
            return null;
        }
    }
}
