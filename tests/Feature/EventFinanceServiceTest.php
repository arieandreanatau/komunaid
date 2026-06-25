<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\Event;
use App\Models\EventFinanceTransaction;
use App\Models\User;
use App\Services\Event\EventFinanceService;
use Tests\TestCase;

class EventFinanceServiceTest extends TestCase
{
    private function makeEvent(User $owner): Event
    {
        $community = Community::factory()->create([
            'owner_id' => $owner->id,
            'created_by' => $owner->id,
            'status' => 'approved',
            'community_type' => 'open',
            'visibility' => 'public',
            'location_type' => 'online',
        ]);

        return Event::create([
            'community_id' => $community->id,
            'owner_id' => $owner->id,
            'title' => 'Test Event ' . uniqid(),
            'slug' => 'test-event-' . uniqid(),
            'description' => 'Test',
            'event_type' => 'volunteer',
            'start_datetime' => now()->addDay(),
            'end_datetime' => now()->addDays(2),
            'status' => 'published',
            'created_by' => $owner->id,
        ]);
    }

    public function test_recompute_summary_with_no_transactions(): void
    {
        $user = User::factory()->create();
        $event = $this->makeEvent($user);

        /** @var EventFinanceService $service */
        $service = app(EventFinanceService::class);
        $summary = $service->recomputeSummary($event->fresh());

        $this->assertEquals(0, (float) $summary->total_income);
        $this->assertEquals(0, (float) $summary->total_expense);
        $this->assertEquals(0, (float) $summary->balance);
        $this->assertNotNull($summary->last_calculated_at);
    }

    public function test_recompute_summary_counts_only_verified_transactions(): void
    {
        $user = User::factory()->create();
        $event = $this->makeEvent($user);

        EventFinanceTransaction::create([
            'event_id' => $event->id,
            'type' => 'income',
            'category' => 'sponsor',
            'title' => 'Sponsor A',
            'amount' => 1000,
            'transaction_date' => now()->toDateString(),
            'created_by' => $user->id,
            'status' => 'verified',
        ]);

        EventFinanceTransaction::create([
            'event_id' => $event->id,
            'type' => 'expense',
            'category' => 'logistics',
            'title' => 'Tent',
            'amount' => 300,
            'transaction_date' => now()->toDateString(),
            'created_by' => $user->id,
            'status' => 'verified',
        ]);

        EventFinanceTransaction::create([
            'event_id' => $event->id,
            'type' => 'income',
            'category' => 'donation',
            'title' => 'Pending donation',
            'amount' => 999,
            'transaction_date' => now()->toDateString(),
            'created_by' => $user->id,
            'status' => 'pending',
        ]);

        /** @var EventFinanceService $service */
        $service = app(EventFinanceService::class);
        $summary = $service->recomputeSummary($event->fresh());

        $this->assertEquals(1000, (float) $summary->total_income);
        $this->assertEquals(300, (float) $summary->total_expense);
        $this->assertEquals(700, (float) $summary->balance);
    }

    public function test_net_balance_returns_float(): void
    {
        $user = User::factory()->create();
        $event = $this->makeEvent($user);

        EventFinanceTransaction::create([
            'event_id' => $event->id,
            'type' => 'income',
            'category' => 'cat',
            'title' => 'T',
            'amount' => 500,
            'transaction_date' => now()->toDateString(),
            'created_by' => $user->id,
            'status' => 'verified',
        ]);

        /** @var EventFinanceService $service */
        $service = app(EventFinanceService::class);
        $net = $service->netBalance($event->fresh());

        $this->assertEquals(500, $net);
    }
}
