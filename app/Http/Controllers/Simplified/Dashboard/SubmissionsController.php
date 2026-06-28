<?php

declare(strict_types=1);

namespace App\Http\Controllers\Simplified\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Community;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class SubmissionsController extends Controller
{
    public function index(Request $request): View
    {
        $user = Auth::user();

        $submissions = collect();

        $submissions = $submissions->merge(
            Community::where('owner_id', $user->id)
                ->whereIn('status', ['pending_approval', 'need_revision', 'rejected', 'approved', 'suspended'])
                ->get()
                ->map(fn ($c) => (object) [
                    'type' => 'community',
                    'type_label' => 'Komunitas',
                    'id' => $c->id,
                    'name' => $c->name,
                    'status' => $c->status,
                    'rejection_reason' => $c->rejection_reason,
                    'revision_notes' => $c->revision_notes,
                    'submitted_at' => $c->submitted_at,
                    'approved_at' => $c->approved_at,
                ])
        );

        $submissions = $submissions->merge(
            Brand::where('owner_id', $user->id)
                ->whereIn('status', ['pending_approval', 'need_revision', 'rejected', 'approved', 'suspended'])
                ->get()
                ->map(fn ($b) => (object) [
                    'type' => 'brand',
                    'type_label' => 'Brand',
                    'id' => $b->id,
                    'name' => $b->name,
                    'status' => $b->status,
                    'rejection_reason' => $b->rejection_reason,
                    'revision_notes' => $b->revision_notes,
                    'submitted_at' => $b->submitted_at,
                    'approved_at' => $b->approved_at,
                ])
        );

        $submissions = $submissions->merge(
            Company::where('owner_id', $user->id)
                ->whereIn('status', ['pending_approval', 'need_revision', 'rejected', 'approved', 'suspended'])
                ->get()
                ->map(fn ($c) => (object) [
                    'type' => 'company',
                    'type_label' => 'Perusahaan',
                    'id' => $c->id,
                    'name' => $c->name,
                    'status' => $c->status,
                    'rejection_reason' => $c->rejection_reason,
                    'revision_notes' => $c->revision_notes,
                    'submitted_at' => $c->submitted_at,
                    'approved_at' => $c->approved_at,
                ])
        );

        $submissions = $submissions->sortByDesc('submitted_at')->values();

        return view('simplified.dashboard.submissions.index', compact('submissions'));
    }

    public function show(Request $request, string $type, int $id): View
    {
        $user = Auth::user();
        $submission = match ($type) {
            'community' => Community::where('id', $id)->where('owner_id', $user->id)->first(),
            'brand' => Brand::where('id', $id)->where('owner_id', $user->id)->first(),
            'company' => Company::where('id', $id)->where('owner_id', $user->id)->first(),
            default => null,
        };

        abort_if(! $submission, 404);

        return view('simplified.dashboard.submissions.show', [
            'submission' => $submission,
            'type' => $type,
        ]);
    }
}
