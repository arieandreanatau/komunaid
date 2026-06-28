<?php

declare(strict_types=1);

use App\Http\Controllers\Public\LanguageController;
use App\Http\Controllers\Public\PublicBlogController;
use App\Http\Controllers\Public\PublicCommunityController;
use App\Http\Controllers\Public\PublicContactController;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Public\PublicHomeController;
use App\Http\Controllers\Public\PublicPageController;
use App\Http\Controllers\Public\PublicSuggestionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| No authentication required. Public-facing site pages.
*/

Route::get('/', [PublicHomeController::class, 'index'])->name('home');

Route::get('/about', fn () => app(PublicPageController::class)->show('about'))->name('about');
Route::get('/contact', [PublicContactController::class, 'index'])->name('contact');
Route::post('/contact/suggestions', [PublicSuggestionController::class, 'store'])->name('suggestions.store');

Route::prefix('blogs')->name('blogs.')->group(function () {
    Route::get('/', [PublicBlogController::class, 'index'])->name('index');
    Route::get('/{slug}', [PublicBlogController::class, 'show'])->name('show');
});
Route::get('/blog', [PublicBlogController::class, 'index'])->name('blog.alias');
Route::get('/blog/{slug}', [PublicBlogController::class, 'show'])->name('blog.alias.show');

Route::get('/komunitas', [PublicCommunityController::class, 'index'])->name('communities.directory');
Route::get('/komunitas/{slug}', [PublicCommunityController::class, 'show'])->name('communities.detail');
Route::get('/communities', [PublicCommunityController::class, 'index'])->name('communities.directory.en');
Route::get('/communities/{slug}', [PublicCommunityController::class, 'show'])->name('communities.detail.en');
Route::get('/events', [PublicEventController::class, 'index'])->name('events.index');
Route::get('/events/{slug}', [PublicEventController::class, 'show'])->name('events.show');

// Language switcher
Route::get('/language/{locale}', LanguageController::class)->name('language.switch');
