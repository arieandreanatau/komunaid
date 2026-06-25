<?php

namespace Database\Seeders;

use App\Models\Community;
use App\Models\Event;
use App\Models\EventType;
use App\Models\EventRegistration;
use App\Models\EventVolunteerCampaign;
use App\Models\EventVolunteerApplication;
use App\Models\EventVolunteer;
use App\Models\EventDonation;
use App\Models\EventFinanceTransaction;
use App\Models\EventFinanceSummary;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoEventSeeder extends Seeder
{
    public function run(): void
    {
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();
        $member = User::where('email', 'member@komuna.test')->first();

        if (!$communityOwner) {
            $this->command->warn('DemoUserSeeder must run first. Skipping DemoEventSeeder.');
            return;
        }

        $bookParty = Community::where('slug', Str::slug('Jakarta Book Party'))->first();
        $volunteerCommunity = Community::where('slug', Str::slug('Komunitas Volunteer Sosial'))->first();
        $urbanRunner = Community::where('slug', Str::slug('Komunitas Urban Runner'))->first();

        if (!$bookParty && !$volunteerCommunity && !$urbanRunner) {
            $this->command->warn('DemoCommunitySeeder must run first. Skipping DemoEventSeeder.');
            return;
        }

        $gatheringType = EventType::where('slug', 'gathering')->first();
        $workshopType = EventType::where('slug', 'workshop')->first();
        $volunteerType = EventType::where('slug', 'volunteer')->first();
        $charityType = EventType::where('slug', 'charity')->first();

        $events = [];

        if ($bookParty) {
            $events[] = [
                'community_id' => $bookParty->id,
                'created_by' => $communityOwner->id,
                'title' => 'Book Party Mingguan',
                'slug' => Str::slug('Book Party Mingguan'),
                'description' => 'Diskusi buku mingguan bersama komunitas Jakarta Book Party. Bawa buku favoritmu dan bagikan rekomendasi!',
                'short_description' => 'Diskusi buku mingguan untuk pecinta literasi.',
                'type_id' => $gatheringType?->id,
                'event_type' => 'free',
                'location_type' => 'offline',
                'location_name' => 'CoWorking Space Jakarta',
                'location_address' => 'Jl. Sudirman No. 123, Jakarta Selatan',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'start_datetime' => Carbon::now()->addDays(7)->setTime(14, 0),
                'end_datetime' => Carbon::now()->addDays(7)->setTime(17, 0),
                'capacity' => 50,
                'price' => 0,
                'registration_status' => 'open',
                'registration_type' => 'free',
                'approval_status' => 'approved',
                'status' => 'published',
                'visibility' => 'public',
                'is_open_volunteer' => false,
                'is_open_donation' => false,
                'is_charity' => false,
            ];

            $events[] = [
                'community_id' => $bookParty->id,
                'created_by' => $communityOwner->id,
                'title' => 'Workshop Menulis Review Buku',
                'slug' => Str::slug('Workshop Menulis Review Buku'),
                'description' => 'Workshop praktis tentang cara menulis review buku yang baik dan menarik.',
                'short_description' => 'Workshop menulis review buku.',
                'type_id' => $workshopType?->id,
                'event_type' => 'free',
                'location_type' => 'offline',
                'location_name' => 'Buku Kopi Cafe',
                'location_address' => 'Jl. Gatot Subroto No. 45, Jakarta Pusat',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'start_datetime' => Carbon::now()->addDays(14)->setTime(10, 0),
                'end_datetime' => Carbon::now()->addDays(14)->setTime(13, 0),
                'capacity' => 30,
                'price' => 0,
                'registration_status' => 'open',
                'registration_type' => 'approval_required',
                'approval_status' => 'approved',
                'status' => 'published',
                'visibility' => 'public',
                'is_open_volunteer' => false,
                'is_open_donation' => false,
                'is_charity' => false,
            ];
        }

        if ($volunteerCommunity) {
            $events[] = [
                'community_id' => $volunteerCommunity->id,
                'created_by' => $communityOwner->id,
                'title' => 'Volunteer Trip Demo',
                'slug' => Str::slug('Volunteer Trip Demo'),
                'description' => 'Trip volunteer ke panti asuhan di Tangerang. Bawa sembako dan mainan untuk anak-anak.',
                'short_description' => 'Trip volunteer ke panti asuhan.',
                'type_id' => $volunteerType?->id,
                'event_type' => 'volunteer',
                'location_type' => 'offline',
                'location_name' => 'Panti Asuhan Harapan',
                'location_address' => 'Jl. Raya Tangerang No. 100, Tangerang',
                'city' => 'Tangerang',
                'province' => 'Banten',
                'start_datetime' => Carbon::now()->addDays(21)->setTime(8, 0),
                'end_datetime' => Carbon::now()->addDays(21)->setTime(15, 0),
                'capacity' => 25,
                'price' => 0,
                'registration_status' => 'open',
                'registration_type' => 'free',
                'approval_status' => 'approved',
                'status' => 'published',
                'visibility' => 'public',
                'is_open_volunteer' => true,
                'is_open_donation' => true,
                'is_charity' => true,
            ];
        }

        if ($urbanRunner) {
            $events[] = [
                'community_id' => $urbanRunner->id,
                'created_by' => $communityOwner->id,
                'title' => 'Charity Run Demo',
                'slug' => Str::slug('Charity Run Demo'),
                'description' => 'Lari amal sejauh 5K untuk menggalang dana pendidikan anak kurang mampu.',
                'short_description' => 'Lari amal 5K untuk pendidikan.',
                'type_id' => $charityType?->id,
                'event_type' => 'charity',
                'location_type' => 'offline',
                'location_name' => 'GBK Senayan',
                'location_address' => 'Jl. Pintu Satu Senayan, Jakarta Pusat',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'start_datetime' => Carbon::now()->addDays(30)->setTime(6, 0),
                'end_datetime' => Carbon::now()->addDays(30)->setTime(10, 0),
                'capacity' => 100,
                'price' => 50000,
                'registration_status' => 'open',
                'registration_type' => 'free',
                'approval_status' => 'approved',
                'status' => 'published',
                'visibility' => 'public',
                'is_open_volunteer' => true,
                'is_open_donation' => true,
                'is_charity' => true,
            ];
        }

        if ($bookParty) {
            $events[] = [
                'community_id' => $bookParty->id,
                'created_by' => $communityOwner->id,
                'title' => 'Draft Event Demo',
                'slug' => Str::slug('Draft Event Demo'),
                'description' => 'Event dalam status draft untuk testing visibility.',
                'short_description' => 'Event draft.',
                'event_type' => 'free',
                'location_type' => 'online',
                'start_datetime' => Carbon::now()->addDays(30)->setTime(19, 0),
                'end_datetime' => Carbon::now()->addDays(30)->setTime(21, 0),
                'capacity' => 20,
                'price' => 0,
                'registration_status' => 'closed',
                'approval_status' => 'pending',
                'status' => 'draft',
                'visibility' => 'private',
                'is_open_volunteer' => false,
                'is_open_donation' => false,
                'is_charity' => false,
            ];
        }

        foreach ($events as $data) {
            $event = Event::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            if ($member && $event->status === 'published') {
                $existingReg = EventRegistration::where('event_id', $event->id)
                    ->where('user_id', $member->id)
                    ->first();

                if (!$existingReg) {
                    EventRegistration::create([
                        'event_id' => $event->id,
                        'user_id' => $member->id,
                        'status' => 'registered',
                        'payment_status' => $event->price > 0 ? 'pending' : 'free',
                        'registered_at' => Carbon::now()->subDays(3),
                    ]);
                }
            }

            if ($event->is_open_volunteer && $member) {
                $campaign = EventVolunteerCampaign::updateOrCreate(
                    ['event_id' => $event->id, 'title' => 'Volunteer ' . $event->title],
                    [
                        'event_id' => $event->id,
                        'description' => 'Kami membutuhkan volunteer untuk event ini.',
                        'quota' => 10,
                        'status' => 'open',
                        'created_by' => $communityOwner->id,
                    ]
                );

                if ($member) {
                    $existingApp = EventVolunteerApplication::where('event_volunteer_campaign_id', $campaign->id)
                        ->where('user_id', $member->id)
                        ->first();

                    if (!$existingApp) {
                        EventVolunteerApplication::create([
                            'event_volunteer_campaign_id' => $campaign->id,
                            'user_id' => $member->id,
                            'motivation' => 'Siap volunteer untuk event ini!',
                            'status' => 'accepted',
                            'reviewed_by' => $communityOwner->id,
                            'reviewed_at' => Carbon::now()->subDays(1),
                        ]);

                        EventVolunteer::create([
                            'event_id' => $event->id,
                            'user_id' => $member->id,
                            'status' => 'active',
                            'assigned_by' => $communityOwner->id,
                            'assigned_at' => Carbon::now()->subDays(1),
                        ]);
                    }
                }
            }

            if ($event->is_open_donation && $member) {
                $existingDonation = EventDonation::where('event_id', $event->id)
                    ->where('donor_user_id', $member->id)
                    ->first();

                if (!$existingDonation) {
                    EventDonation::create([
                        'event_id' => $event->id,
                        'donor_user_id' => $member->id,
                        'amount' => 25000,
                        'message' => 'Semoga event sukses!',
                        'status' => 'verified',
                        'donated_at' => Carbon::now()->subDays(1),
                    ]);

                    EventFinanceTransaction::create([
                        'event_id' => $event->id,
                        'type' => 'income',
                        'title' => 'Donasi dari ' . $member->name,
                        'amount' => 25000,
                        'transaction_date' => Carbon::now()->subDays(1),
                        'created_by' => $communityOwner->id,
                        'status' => 'verified',
                    ]);

                    EventFinanceSummary::updateOrCreate(
                        ['event_id' => $event->id],
                        [
                            'total_income' => 25000,
                            'total_expense' => 0,
                            'balance' => 25000,
                        ]
                    );
                }
            }
        }
    }
}
