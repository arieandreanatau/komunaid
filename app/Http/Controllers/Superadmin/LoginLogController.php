<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    public function index(Request $request)
    {
        $query = LoginLog::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->filled('success')) {
            $query->where('success', $request->boolean('success'));
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $loginLogs = $query->latest()->paginate(30);

        return view('superadmin.login-logs.index', compact('loginLogs'));
    }

    public function today()
    {
        $loginLogs = LoginLog::with('user')
            ->whereDate('created_at', today())
            ->latest()
            ->paginate(30);

        return view('superadmin.login-logs.today', compact('loginLogs'));
    }
}
