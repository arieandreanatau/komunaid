<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactSetting;

class PublicContactController extends Controller
{
    public function index()
    {
        $contactSettings = ContactSetting::active()
            ->orderBy('sort_order')
            ->get();

        return view('public.contact', compact('contactSettings'));
    }
}
