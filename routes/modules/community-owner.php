<?php

declare(strict_types=1);

use App\Http\Controllers\CommunityOwner\CommunityCollaborationController as CommunityCollaborationController;
use App\Http\Controllers\CommunityOwner\CommunityController as CommunityOwnerCommunityController;
use App\Http\Controllers\CommunityOwner\CommunityWalletController;
use App\Http\Controllers\CommunityOwner\DashboardController as CommunityOwnerDashboardController;
use App\Http\Controllers\CommunityOwner\DonationController as CommunityOwnerDonationController;
use App\Http\Controllers\CommunityOwner\EventChatController as CommunityOwnerEventChatController;
use App\Http\Controllers\CommunityOwner\EventController as CommunityOwnerEventController;
use App\Http\Controllers\CommunityOwner\EventDonationController as CommunityOwnerEventDonationController;
use App\Http\Controllers\CommunityOwner\EventFinanceController as CommunityOwnerEventFinanceController;
use App\Http\Controllers\CommunityOwner\EventGalleryController as CommunityOwnerEventGalleryController;
use App\Http\Controllers\CommunityOwner\EventParticipantController as CommunityOwnerEventParticipantController;
use App\Http\Controllers\CommunityOwner\EventVolunteerApplicationController as CommunityOwnerEventVolunteerApplicationController;
use App\Http\Controllers\CommunityOwner\EventVolunteerCampaignController as CommunityOwnerEventVolunteerCampaignController;
use App\Http\Controllers\CommunityOwner\EventVolunteerController as CommunityOwnerEventVolunteerController;
use App\Http\Controllers\CommunityOwner\MemberController as CommunityOwnerMemberController;
use App\Http\Controllers\CommunityOwner\ProposalCollaborationController;
use App\Http\Controllers\CommunityOwner\RegionController as CommunityOwnerRegionController;
use App\Http\Controllers\CommunityOwner\SubgroupController as CommunityOwnerSubgroupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Community Owner Routes
|--------------------------------------------------------------------------
| URL prefix /community-own, name prefix community.* (kept for backward compat).
| Middleware: role:community_owner
*/

Route::prefix('community-own')->name('community.')->middleware('role:community_owner')->group(function () {
    Route::get('/dashboard', [CommunityOwnerDashboardController::class, 'index'])->name('dashboard');

    // Community CRUD
    Route::get('/communities', [CommunityOwnerCommunityController::class, 'index'])->name('communities.index');
    Route::get('/communities/create', [CommunityOwnerCommunityController::class, 'create'])->name('communities.create');
    Route::post('/communities', [CommunityOwnerCommunityController::class, 'store'])->name('communities.store');
    Route::get('/communities/{community}', [CommunityOwnerCommunityController::class, 'show'])->name('communities.show');
    Route::get('/communities/{community}/edit', [CommunityOwnerCommunityController::class, 'edit'])->name('communities.edit');
    Route::put('/communities/{community}', [CommunityOwnerCommunityController::class, 'update'])->name('communities.update');
    Route::delete('/communities/{community}', [CommunityOwnerCommunityController::class, 'destroy'])->name('communities.destroy');

    // Member Management
    Route::get('/communities/{community}/members', [CommunityOwnerMemberController::class, 'index'])->name('members.index');
    Route::post('/communities/{community}/members/{member}/approve', [CommunityOwnerMemberController::class, 'approveMember'])->name('members.approve');
    Route::put('/communities/{community}/members/{member}/role', [CommunityOwnerMemberController::class, 'updateRole'])->name('members.update-role');
    Route::delete('/communities/{community}/members/{member}/remove', [CommunityOwnerMemberController::class, 'remove'])->name('members.remove');
    Route::post('/communities/{community}/members/{member}/ban', [CommunityOwnerMemberController::class, 'ban'])->name('members.ban');
    Route::post('/communities/{community}/members/{member}/unban', [CommunityOwnerMemberController::class, 'unban'])->name('members.unban');

    // Region Management
    Route::get('/communities/{community}/regions', [CommunityOwnerRegionController::class, 'index'])->name('regions.index');
    Route::get('/communities/{community}/regions/create', [CommunityOwnerRegionController::class, 'create'])->name('regions.create');
    Route::post('/communities/{community}/regions', [CommunityOwnerRegionController::class, 'store'])->name('regions.store');
    Route::get('/communities/{community}/regions/{region}', [CommunityOwnerRegionController::class, 'show'])->name('regions.show');
    Route::delete('/communities/{community}/regions/{region}', [CommunityOwnerRegionController::class, 'destroy'])->name('regions.destroy');

    // Subgroup Management
    Route::get('/communities/{community}/subgroups', [CommunityOwnerSubgroupController::class, 'index'])->name('subgroups.index');
    Route::get('/communities/{community}/subgroups/create', [CommunityOwnerSubgroupController::class, 'create'])->name('subgroups.create');
    Route::post('/communities/{community}/subgroups', [CommunityOwnerSubgroupController::class, 'store'])->name('subgroups.store');
    Route::delete('/communities/{community}/subgroups/{subgroup}', [CommunityOwnerSubgroupController::class, 'destroy'])->name('subgroups.destroy');

    // Event Management
    Route::get('/events', [CommunityOwnerEventController::class, 'index'])->name('events.index');
    Route::get('/events/create', [CommunityOwnerEventController::class, 'create'])->name('events.create');
    Route::post('/events', [CommunityOwnerEventController::class, 'store'])->name('events.store');
    Route::get('/events/{event}', [CommunityOwnerEventController::class, 'show'])->name('events.show');
    Route::get('/events/{event}/edit', [CommunityOwnerEventController::class, 'edit'])->name('events.edit');
    Route::put('/events/{event}', [CommunityOwnerEventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [CommunityOwnerEventController::class, 'destroy'])->name('events.destroy');

    // Event Registrations
    Route::get('/events/{event}/registrations', [CommunityOwnerEventController::class, 'registrations'])->name('events.registrations');
    Route::post('/events/{event}/registrations/{registration}/confirm', [CommunityOwnerEventController::class, 'confirmPayment'])->name('events.confirm-payment');
    Route::post('/events/{event}/registrations/{registration}/reject', [CommunityOwnerEventController::class, 'rejectPayment'])->name('events.reject-payment');

    // Event Actions (publish/cancel/archive)
    Route::post('/events/{event}/publish', [CommunityOwnerEventController::class, 'publish'])->name('events.publish');
    Route::post('/events/{event}/cancel', [CommunityOwnerEventController::class, 'cancel'])->name('events.cancel');
    Route::post('/events/{event}/archive', [CommunityOwnerEventController::class, 'archive'])->name('events.archive');

    // Event Participants
    Route::get('/events/{event}/participants', [CommunityOwnerEventParticipantController::class, 'index'])->name('events.participants.index');
    Route::get('/events/{event}/participants/export', [CommunityOwnerEventParticipantController::class, 'export'])->name('events.participants.export');
    Route::post('/events/{event}/participants/{registration}/approve', [CommunityOwnerEventParticipantController::class, 'approve'])->name('events.participants.approve');
    Route::post('/events/{event}/participants/{registration}/reject', [CommunityOwnerEventParticipantController::class, 'reject'])->name('events.participants.reject');
    Route::post('/events/{event}/participants/{registration}/mark-attended', [CommunityOwnerEventParticipantController::class, 'markAttended'])->name('events.participants.mark-attended');
    Route::post('/events/{event}/participants/{registration}/cancel', [CommunityOwnerEventParticipantController::class, 'cancelParticipant'])->name('events.participants.cancel');

    // Event Volunteer Campaign
    Route::get('/events/{event}/volunteer-campaign', [CommunityOwnerEventVolunteerCampaignController::class, 'show'])->name('events.volunteer-campaign.show');
    Route::get('/events/{event}/volunteer-campaign/create', [CommunityOwnerEventVolunteerCampaignController::class, 'create'])->name('events.volunteer-campaign.create');
    Route::post('/events/{event}/volunteer-campaign', [CommunityOwnerEventVolunteerCampaignController::class, 'store'])->name('events.volunteer-campaign.store');
    Route::get('/events/{event}/volunteer-campaign/{campaign}/edit', [CommunityOwnerEventVolunteerCampaignController::class, 'edit'])->name('events.volunteer-campaign.edit');
    Route::put('/events/{event}/volunteer-campaign/{campaign}', [CommunityOwnerEventVolunteerCampaignController::class, 'update'])->name('events.volunteer-campaign.update');
    Route::post('/events/{event}/volunteer-campaign/{campaign}/open', [CommunityOwnerEventVolunteerCampaignController::class, 'open'])->name('events.volunteer-campaign.open');
    Route::post('/events/{event}/volunteer-campaign/{campaign}/close', [CommunityOwnerEventVolunteerCampaignController::class, 'close'])->name('events.volunteer-campaign.close');
    Route::delete('/events/{event}/volunteer-campaign/{campaign}', [CommunityOwnerEventVolunteerCampaignController::class, 'destroy'])->name('events.volunteer-campaign.destroy');

    // Event Volunteer Applications
    Route::get('/events/{event}/volunteer-campaign/{campaign}/applications', [CommunityOwnerEventVolunteerApplicationController::class, 'index'])->name('events.volunteer-applications.index');
    Route::get('/events/{event}/volunteer-campaign/{campaign}/applications/{application}', [CommunityOwnerEventVolunteerApplicationController::class, 'show'])->name('events.volunteer-applications.show');
    Route::post('/events/{event}/volunteer-campaign/{campaign}/applications/{application}/accept', [CommunityOwnerEventVolunteerApplicationController::class, 'accept'])->name('events.volunteer-applications.accept');
    Route::post('/events/{event}/volunteer-campaign/{campaign}/applications/{application}/reject', [CommunityOwnerEventVolunteerApplicationController::class, 'reject'])->name('events.volunteer-applications.reject');

    // Event Volunteers
    Route::get('/events/{event}/volunteers', [CommunityOwnerEventVolunteerController::class, 'index'])->name('events.volunteers.index');
    Route::get('/events/{event}/volunteers/export', [CommunityOwnerEventVolunteerController::class, 'export'])->name('events.volunteers.export');
    Route::post('/events/{event}/volunteers/{volunteer}/activate', [CommunityOwnerEventVolunteerController::class, 'activate'])->name('events.volunteers.activate');
    Route::post('/events/{event}/volunteers/{volunteer}/deactivate', [CommunityOwnerEventVolunteerController::class, 'deactivate'])->name('events.volunteers.deactivate');
    Route::delete('/events/{event}/volunteers/{volunteer}', [CommunityOwnerEventVolunteerController::class, 'destroy'])->name('events.volunteers.destroy');

    // Event Donations (EventDonation model)
    Route::get('/events/{event}/donations', [CommunityOwnerEventDonationController::class, 'index'])->name('events.donations.index');
    Route::get('/events/{event}/donations/export', [CommunityOwnerEventDonationController::class, 'export'])->name('events.donations.export');
    Route::post('/events/{event}/donations/{donation}/verify', [CommunityOwnerEventDonationController::class, 'verify'])->name('events.donations.verify');
    Route::post('/events/{event}/donations/{donation}/reject', [CommunityOwnerEventDonationController::class, 'reject'])->name('events.donations.reject');

    // Event Finance
    Route::get('/events/{event}/finance', [CommunityOwnerEventFinanceController::class, 'index'])->name('events.finance.index');
    Route::get('/events/{event}/finance/create', [CommunityOwnerEventFinanceController::class, 'create'])->name('events.finance.create');
    Route::post('/events/{event}/finance', [CommunityOwnerEventFinanceController::class, 'store'])->name('events.finance.store');
    Route::get('/events/{event}/finance/{transaction}/edit', [CommunityOwnerEventFinanceController::class, 'edit'])->name('events.finance.edit');
    Route::put('/events/{event}/finance/{transaction}', [CommunityOwnerEventFinanceController::class, 'update'])->name('events.finance.update');
    Route::post('/events/{event}/finance/{transaction}/verify', [CommunityOwnerEventFinanceController::class, 'verify'])->name('events.finance.verify');
    Route::post('/events/{event}/finance/{transaction}/reject', [CommunityOwnerEventFinanceController::class, 'reject'])->name('events.finance.reject');
    Route::delete('/events/{event}/finance/{transaction}', [CommunityOwnerEventFinanceController::class, 'destroy'])->name('events.finance.destroy');
    Route::get('/events/{event}/finance/export', [CommunityOwnerEventFinanceController::class, 'export'])->name('events.finance.export');

    // Event Gallery
    Route::get('/events/{event}/galleries', [CommunityOwnerEventGalleryController::class, 'index'])->name('events.galleries.index');
    Route::post('/events/{event}/galleries', [CommunityOwnerEventGalleryController::class, 'store'])->name('events.galleries.store');
    Route::delete('/events/{event}/galleries/{gallery}', [CommunityOwnerEventGalleryController::class, 'destroy'])->name('events.galleries.destroy');

    // Event Chat (Forum)
    Route::get('/events/{event}/chats', [CommunityOwnerEventChatController::class, 'index'])->name('events.chats.index');
    Route::post('/events/{event}/chats', [CommunityOwnerEventChatController::class, 'store'])->name('events.chats.store');
    Route::get('/events/{event}/chats/{chat}', [CommunityOwnerEventChatController::class, 'show'])->name('events.chats.show');
    Route::post('/events/{event}/chats/{chat}/pin', [CommunityOwnerEventChatController::class, 'togglePin'])->name('events.chats.pin');
    Route::delete('/events/{event}/chats/{chat}', [CommunityOwnerEventChatController::class, 'destroy'])->name('events.chats.destroy');
    Route::post('/events/{event}/chats/{chat}/threads/{thread}/approve', [CommunityOwnerEventChatController::class, 'approveThread'])->name('events.chats.approve-thread');
    Route::post('/events/{event}/chats/{chat}/threads/{thread}/reject', [CommunityOwnerEventChatController::class, 'rejectThread'])->name('events.chats.reject-thread');

    // Community Collaboration (incoming & outgoing)
    Route::get('/collaborations', [CommunityCollaborationController::class, 'index'])->name('collaborations.index');
    Route::get('/collaborations/create', [CommunityCollaborationController::class, 'create'])->name('collaborations.create');
    Route::post('/collaborations', [CommunityCollaborationController::class, 'store'])->name('collaborations.store');
    Route::get('/collaborations/{collaboration}', [CommunityCollaborationController::class, 'show'])->name('collaborations.show');
    Route::post('/collaborations/{collaboration}/accept', [CommunityCollaborationController::class, 'accept'])->name('collaborations.accept');
    Route::post('/collaborations/{collaboration}/reject', [CommunityCollaborationController::class, 'reject'])->name('collaborations.reject');
    Route::post('/collaborations/{collaboration}/cancel', [CommunityCollaborationController::class, 'cancel'])->name('collaborations.cancel');
    Route::post('/collaborations/{collaboration}/complete', [CommunityCollaborationController::class, 'complete'])->name('collaborations.complete');

    // Collaboration Proposals (new system - from brand/company)
    Route::get('/proposals', [ProposalCollaborationController::class, 'index'])->name('proposals.index');
    Route::get('/proposals/{proposal}', [ProposalCollaborationController::class, 'show'])->name('proposals.show');
    Route::post('/proposals/{proposal}/review', [ProposalCollaborationController::class, 'review'])->name('proposals.review');
    Route::post('/proposals/{proposal}/accept', [ProposalCollaborationController::class, 'accept'])->name('proposals.accept');
    Route::post('/proposals/{proposal}/reject', [ProposalCollaborationController::class, 'reject'])->name('proposals.reject');
    Route::post('/proposals/{proposal}/complete', [ProposalCollaborationController::class, 'complete'])->name('proposals.complete');
    Route::post('/proposals/{proposal}/cancel', [ProposalCollaborationController::class, 'cancel'])->name('proposals.cancel');
    Route::get('/proposals/export', [ProposalCollaborationController::class, 'export'])->name('proposals.export');

    // Community Wallet
    Route::get('/wallet', [CommunityWalletController::class, 'index'])->name('wallet.index');

    // Donations Management
    Route::get('/donations', [CommunityOwnerDonationController::class, 'index'])->name('donations.index');
    Route::get('/donations/{donation}', [CommunityOwnerDonationController::class, 'show'])->name('donations.show');
    Route::post('/donations/{donation}/confirm', [CommunityOwnerDonationController::class, 'confirm'])->name('donations.confirm');
    Route::post('/donations/{donation}/reject', [CommunityOwnerDonationController::class, 'reject'])->name('donations.reject');
});
