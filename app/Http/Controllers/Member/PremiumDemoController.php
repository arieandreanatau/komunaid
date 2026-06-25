<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Services\Premium\PremiumAccessService;
use App\Support\Enums\FeatureKeyEnum;
use Illuminate\Http\Request;

class PremiumDemoController extends Controller
{
    public function __construct(private readonly PremiumAccessService $premium) {}

    public function show(Request $request)
    {
        $user = $request->user();
        $features = collect(FeatureKeyEnum::cases())->map(function (FeatureKeyEnum $f) use ($user) {
            return [
                'key' => $f->value,
                'locked' => $this->premium->isLockedByEnum($user, $f),
            ];
        });

        return view('premium.demo', ['features' => $features]);
    }
}
