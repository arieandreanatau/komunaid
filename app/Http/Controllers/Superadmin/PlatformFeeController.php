<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Services\PlatformFeeService;
use App\Models\PlatformFee;
use Illuminate\Http\Request;

class PlatformFeeController extends Controller
{
    protected PlatformFeeService $platformFeeService;

    public function __construct(PlatformFeeService $platformFeeService)
    {
        $this->platformFeeService = $platformFeeService;
    }

    public function index()
    {
        $report = $this->platformFeeService->getFeeReport(20);
        $monthlyStats = $this->platformFeeService->getStatsByMonth();

        $summary = [
            'total_gross' => $this->platformFeeService->getTotalGrossIncome(),
            'total_fee' => $this->platformFeeService->getPlatformRevenue(),
            'total_transactions' => PlatformFee::count(),
        ];

        return view('superadmin.platform-fees.index', compact('report', 'monthlyStats', 'summary'));
    }

    public function show(PlatformFee $platformFee)
    {
        $platformFee->load('event.community', 'registration.user', 'paymentConfirmation');

        return view('superadmin.platform-fees.show', compact('platformFee'));
    }
}
