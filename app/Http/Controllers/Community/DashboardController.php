<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return view('community.dashboard', compact('user'));
    }
}
