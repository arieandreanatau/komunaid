<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\DashboardRedirectController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Member\BookmarkController as MemberBookmarkController;
use App\Http\Controllers\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Member\DonationController as MemberDonationController;
use App\Http\Controllers\Member\EventChatController as MemberEventChatController;
use App\Http\Controllers\Member\EventController as MemberEventController;
use App\Http\Controllers\Member\FriendController as MemberFriendController;
use App\Http\Controllers\Member\GalleryController as MemberGalleryController;
use App\Http\Controllers\Member\HistoryController as MemberHistoryController;
use App\Http\Controllers\Member\InterestController as MemberInterestController;
use App\Http\Controllers\Member\MyCommunityController as MemberMyCommunityController;
use App\Http\Controllers\Member\MyEventController as MemberMyEventController;
use App\Http\Controllers\Member\PremiumDemoController as MemberPremiumDemoController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\Member\RoleRequestController;
use App\Http\Controllers\Member\WalletController as MemberWalletController;
use App\Http\Controllers\Member\MyCommunityController as MemberCommunityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Member Routes
|--------------------------------------------------------------------------
| Authenticated regular members. active_user + not.banned enforced via
| module-level middleware applied from routes/web.php.
*/

// Dashboard redirect (sits in /dashboard for any authenticated user)
Route::get('/dashboard', DashboardRedirectController::class)
    ->name('dashboard.redirect');

// Onboarding (any authenticated user)
Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/', [OnboardingController::class, 'index'])->name('index');
    Route::get('/role-request', [OnboardingController::class, 'roleRequest'])->name('role-request');
    Route::post('/role-request', [OnboardingController::class, 'storeRoleRequest'])->name('role-request.store');
    Route::get('/role-request/status/{roleRequest}', [OnboardingController::class, 'roleRequestStatus'])->name('role-request.status');
    Route::post('/continue-as-member', [OnboardingController::class, 'continueAsMember'])->name('continue-as-member');
});

// Bare alias for onboarding (preserved for backward compat with existing code)
Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');

// Member community actions (join / leave / report)
Route::post('/komunitas/{community:slug}/join', [MemberCommunityController::class, 'join'])
    ->name('community_action.join')->middleware('active_user');
Route::post('/komunitas/{community:slug}/leave', [MemberCommunityController::class, 'leave'])
    ->name('community_action.leave')->middleware('active_user');
Route::post('/komunitas/{community:slug}/report', [MemberCommunityController::class, 'report'])
    ->name('community_action.report')->middleware('active_user');

// Member dashboard + features
Route::prefix('member')->name('member.')->middleware('active_user')->group(function () {
    Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('dashboard');

    // Premium Demo
    Route::get('/premium-demo', [MemberPremiumDemoController::class, 'show'])->name('premium-demo');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Interests
    Route::get('/interests', [MemberInterestController::class, 'index'])->name('interests.index');
    Route::put('/interests', [MemberInterestController::class, 'update'])->name('interests.update');

    // My Communities
    Route::get('/communities', [MemberMyCommunityController::class, 'index'])->name('communities.index');
    Route::get('/communities/export', [MemberMyCommunityController::class, 'export'])->name('communities.export');
    Route::get('/communities/{community}', [MemberMyCommunityController::class, 'show'])->name('communities.show');

    // My Events
    Route::get('/events', [MemberMyEventController::class, 'index'])->name('events.index');
    Route::get('/events/export', [MemberMyEventController::class, 'export'])->name('events.export');

    // Friends
    Route::get('/friends', [MemberFriendController::class, 'index'])->name('friends.index');
    Route::get('/friends/search', [MemberFriendController::class, 'search'])->name('friends.search');
    Route::post('/friends/{user}/request', [MemberFriendController::class, 'request'])->name('friends.request');
    Route::post('/friends/{friendship}/accept', [MemberFriendController::class, 'accept'])->name('friends.accept');
    Route::post('/friends/{friendship}/reject', [MemberFriendController::class, 'reject'])->name('friends.reject');
    Route::delete('/friends/{friendship}', [MemberFriendController::class, 'remove'])->name('friends.remove');
    Route::get('/friends/{user}/communities', [MemberFriendController::class, 'communities'])->name('friends.communities');

    // Bookmarks
    Route::get('/bookmarks', [MemberBookmarkController::class, 'index'])->name('bookmarks.index');
    Route::post('/bookmarks/{community}', [MemberBookmarkController::class, 'store'])->name('bookmarks.store');
    Route::delete('/bookmarks/{community}', [MemberBookmarkController::class, 'destroy'])->name('bookmarks.destroy');

    // Gallery
    Route::get('/gallery', [MemberGalleryController::class, 'index'])->name('galleries.index');
    Route::get('/gallery/create', [MemberGalleryController::class, 'create'])->name('galleries.create');
    Route::post('/gallery', [MemberGalleryController::class, 'store'])->name('galleries.store');
    Route::get('/gallery/{gallery}/edit', [MemberGalleryController::class, 'edit'])->name('galleries.edit');
    Route::put('/gallery/{gallery}', [MemberGalleryController::class, 'update'])->name('galleries.update');
    Route::delete('/gallery/{gallery}', [MemberGalleryController::class, 'destroy'])->name('galleries.destroy');

    // History
    Route::get('/history', [MemberHistoryController::class, 'index'])->name('history.index');

    // Role Request
    Route::get('/role-requests', [RoleRequestController::class, 'index'])->name('role-requests.index');
    Route::get('/role-requests/create', [RoleRequestController::class, 'create'])->name('role-requests.create');
    Route::post('/role-requests', [RoleRequestController::class, 'store'])->name('role-requests.store');
    Route::get('/role-requests/{roleRequest}', [RoleRequestController::class, 'show'])->name('role-requests.show');

    // Member event registration / payment / cancel
    Route::post('/events/{event:slug}/register', [MemberEventController::class, 'register'])->name('events.register');
    Route::post('/events/{event:slug}/payment/{registration}', [MemberEventController::class, 'uploadPayment'])->name('events.upload-payment');
    Route::post('/events/{event:slug}/cancel/{registration}', [MemberEventController::class, 'cancelRegistration'])->name('events.cancel');
    Route::get('/my-registrations', [MemberEventController::class, 'myRegistrations'])->name('events.my-registrations');

    // Member event chat (member side)
    Route::get('/events/{event:slug}/chat/{chat}', [MemberEventChatController::class, 'show'])->name('events.chat.show');
    Route::post('/events/{event:slug}/chat/{chat}/reply', [MemberEventChatController::class, 'storeThread'])->name('events.chat.reply');

    // Member volunteer applications
    Route::get('/events/{event:slug}/volunteer/apply', [MemberEventController::class, 'showVolunteerApply'])->name('events.volunteer.apply');
    Route::post('/events/{event:slug}/volunteer/apply', [MemberEventController::class, 'storeVolunteerApply'])->name('events.volunteer.apply.store');
    Route::get('/event-volunteer-applications', [MemberEventController::class, 'myVolunteerApplications'])->name('event-volunteer-applications.index');

    // Member event donation
    Route::get('/events/{event:slug}/donate', [MemberEventController::class, 'showEventDonation'])->name('events.donate');
    Route::post('/events/{event:slug}/donate', [MemberEventController::class, 'storeEventDonation'])->name('events.donate.store');

    // Wallet
    Route::get('/wallet', [MemberWalletController::class, 'index'])->name('wallet.index');
    Route::get('/wallet/history', [MemberWalletController::class, 'history'])->name('wallet.history');

    // Donations
    Route::get('/donations', [MemberDonationController::class, 'index'])->name('donations.index');
    Route::get('/donations/{donation}', [MemberDonationController::class, 'show'])->name('donations.show');
    Route::get('/donations/event/{event:slug}', [MemberDonationController::class, 'createEventDonation'])->name('donations.create-event');
    Route::post('/donations/event/{event:slug}', [MemberDonationController::class, 'storeEventDonation'])->name('donations.store-event');
    Route::get('/donations/community/{community}', [MemberDonationController::class, 'createCommunityDonation'])->name('donations.create-community');
    Route::post('/donations/community/{community}', [MemberDonationController::class, 'storeCommunityDonation'])->name('donations.store-community');
});
