<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/*
|--------------------------------------------------------------------------
| LanguageController
|--------------------------------------------------------------------------
| Handles locale switching from the public-facing language switcher
| component. Stores the chosen locale in the session and applies it to
| the application immediately. Bounces the user back to the previous URL
| (or home if none).
*/

class LanguageController extends Controller
{
    public function __invoke(Request $request, string $locale): RedirectResponse
    {
        $supported = ['id', 'en'];

        if (!in_array($locale, $supported, true)) {
            abort(404);
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        $previous = $request->headers->get('referer');

        if ($previous && filter_var($previous, FILTER_VALIDATE_URL)) {
            return redirect()->to($previous);
        }

        return redirect()->route('home');
    }
}
