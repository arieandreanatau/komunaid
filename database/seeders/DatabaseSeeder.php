<?php

namespace Database\Seeders;

use App\Models\ApprovalLog;
use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\Campaign;
use App\Models\CollaborationRequest;
use App\Models\Community;
use App\Models\CommunityBan;
use App\Models\CommunityMember;
use App\Models\CommunityMemberRole;
use App\Models\CommunityRegion;
use App\Models\CommunitySubgroup;
use App\Models\Donation;
use App\Models\Event;
use App\Models\EventChat;
use App\Models\EventChatThread;
use App\Models\EventPaymentConfirmation;
use App\Models\EventRegistration;
use App\Models\MemberJoinHistory;
use App\Models\PlatformFee;
use App\Models\Profile;
use App\Models\RoleRequest;
use App\Models\User;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CommunityCategorySeeder::class,
        ]);

        $walletService = app(WalletService::class);

        // ─── Demo Users ─────────────────────────────────────
        $superadmin = $this->createUser('Super Admin', 'superadmin@komuna.id', 'superadmin', 'superadmin', 'Platform administrator', 'Jakarta', 'DKI Jakarta');
        $member = $this->createUser('Member User', 'member@komuna.id', 'member', 'member', 'Anggota aktif KomunaID', 'Jakarta', 'DKI Jakarta');
        $communityOwner = $this->createUser('Community Owner', 'community@komuna.id', 'community_owner', 'community_owner', 'Pemilik komunitas di KomunaID', 'Bandung', 'Jawa Barat');
        $brandOwner = $this->createUser('Brand Owner', 'brand@komuna.id', 'brand_owner', 'brand_owner', 'Pemilik brand di KomunaID', 'Surabaya', 'Jawa Timur');

        $owner2 = $this->createUser('Rina Community Owner', 'owner2@komuna.id', 'community_owner', 'rina_owner', 'Pemilik komunitas gaming', 'Jakarta', 'DKI Jakarta');
        $brandStaff = $this->createUser('Ahmad Staff', 'staff@komuna.id', 'brand_staff', 'ahmad_staff', 'Staff brand', 'Yogyakarta', 'DI Yogyakarta');
        $member2 = $this->createUser('Sari Member', 'member2@komuna.id', 'member', 'sari_m', 'Anggota komunitas', 'Semarang', 'Jawa Tengah');
        $member3 = $this->createUser('Budi Member', 'member3@komuna.id', 'member', 'budi_m', 'Anggota komunitas', 'Malang', 'Jawa Timur');

        // ─── Pending Role Requests ──────────────────────────
        RoleRequest::create([
            'user_id' => $member2->id,
            'requested_role' => 'community_owner',
            'status' => 'pending',
            'notes' => 'Ingin membuat komunitas di Semarang.',
        ]);
        RoleRequest::create([
            'user_id' => $member3->id,
            'requested_role' => 'brand_owner',
            'status' => 'approved',
            'reviewed_by' => $superadmin->id,
            'reviewed_at' => Carbon::now()->subDays(5),
            'notes' => 'Disetujui untuk membuat brand.',
        ]);
        RoleRequest::create([
            'user_id' => $member2->id,
            'requested_role' => 'brand_owner',
            'status' => 'rejected',
            'reviewed_by' => $superadmin->id,
            'reviewed_at' => Carbon::now()->subDays(2),
            'notes' => 'Belum memenuhi syarat.',
        ]);

        // ─── Communities ────────────────────────────────────
        $approvedCommunity1 = Community::create([
            'category_id' => 1,
            'owner_id' => $communityOwner->id,
            'name' => 'Laravel Indonesia',
            'slug' => 'laravel-indonesia',
            'description' => 'Komunitas pengembang Laravel di Indonesia.',
            'about' => 'Laravel Indonesia adalah komunitas terbesar untuk pengembang Laravel di Indonesia.',
            'region' => 'Jawa Barat',
            'city' => 'Bandung',
            'contact_email' => 'laravel@komuna.id',
            'instagram' => '@laravel_indo',
            'community_type' => 'open',
            'visibility' => 'public',
            'status' => 'approved',
            'is_public' => true,
            'max_members' => 500,
        ]);

        $approvedCommunity2 = Community::create([
            'category_id' => 1,
            'owner_id' => $communityOwner->id,
            'name' => 'React Jakarta',
            'slug' => 'react-jakarta',
            'description' => 'Komunitas React.js developer di Jakarta.',
            'region' => 'DKI Jakarta',
            'city' => 'Jakarta',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $approvedCommunity3 = Community::create([
            'category_id' => 2,
            'owner_id' => $communityOwner->id,
            'name' => 'Startup Bandung',
            'slug' => 'startup-bandung',
            'description' => 'Komunitas startup founder di Bandung.',
            'region' => 'Jawa Barat',
            'city' => 'Bandung',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $approvedCommunity4 = Community::create([
            'category_id' => 3,
            'owner_id' => $owner2->id,
            'name' => 'UI/UX Surabaya',
            'slug' => 'uiux-surabaya',
            'description' => 'Komunitas desainer UI/UX di Surabaya.',
            'region' => 'Jawa Timur',
            'city' => 'Surabaya',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $approvedCommunity5 = Community::create([
            'category_id' => 4,
            'owner_id' => $owner2->id,
            'name' => 'Running Jakarta',
            'slug' => 'running-jakarta',
            'description' => 'Komunitas pelari di Jakarta.',
            'region' => 'DKI Jakarta',
            'city' => 'Jakarta',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $gamingCommunity = Community::create([
            'category_id' => 4,
            'owner_id' => $owner2->id,
            'name' => 'Gaming Indonesia',
            'slug' => 'gaming-indonesia',
            'description' => 'Komunitas gamer Indonesia.',
            'about' => 'Gaming Indonesia mengadakan turnamen mingguan.',
            'region' => 'Nasional',
            'city' => 'Online',
            'community_type' => 'closed',
            'visibility' => 'public',
            'status' => 'approved',
            'is_public' => true,
        ]);

        $pendingCommunity = Community::create([
            'category_id' => 1,
            'owner_id' => $communityOwner->id,
            'name' => 'Koding Bareng',
            'slug' => 'koding-bareng',
            'description' => 'Komunitas belajar coding untuk pemula.',
            'region' => 'DKI Jakarta',
            'city' => 'Jakarta',
            'community_type' => 'open',
            'visibility' => 'public',
            'status' => 'pending',
            'is_public' => true,
        ]);

        $rejectedCommunity = Community::create([
            'category_id' => 10,
            'owner_id' => $owner2->id,
            'name' => 'Komunitas Tutup',
            'slug' => 'komunitas-tutup',
            'description' => 'Komunitas yang sudah ditutup.',
            'region' => 'Jawa Tengah',
            'city' => 'Semarang',
            'community_type' => 'closed',
            'visibility' => 'private',
            'status' => 'rejected',
            'is_public' => false,
        ]);

        // ─── Regions & Subgroups ────────────────────────────
        CommunityRegion::create([
            'community_id' => $gamingCommunity->id,
            'owner_id' => $owner2->id,
            'name' => 'Jakarta Raya',
            'slug' => 'jakarta-raya',
            'description' => 'Regional gaming Jakarta.',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'status' => 'active',
        ]);
        CommunityRegion::create([
            'community_id' => $gamingCommunity->id,
            'owner_id' => $owner2->id,
            'name' => 'Bandung',
            'slug' => 'bandung',
            'description' => 'Regional gaming Bandung.',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'status' => 'active',
        ]);

        $esportSubgroup = CommunitySubgroup::create([
            'community_id' => $gamingCommunity->id,
            'owner_id' => $owner2->id,
            'name' => 'E-Sport',
            'slug' => 'e-sport',
            'description' => 'Divisi kompetitif gaming.',
            'status' => 'active',
        ]);
        CommunitySubgroup::create([
            'community_id' => $gamingCommunity->id,
            'owner_id' => $owner2->id,
            'name' => 'Casual Gaming',
            'slug' => 'casual-gaming',
            'description' => 'Gaming santai dan fun.',
            'status' => 'active',
        ]);

        // ─── Community Members ──────────────────────────────
        $this->addMember($approvedCommunity1->id, $member->id, 'member', $communityOwner->id);
        $this->addMember($approvedCommunity1->id, $member2->id, 'member', $communityOwner->id);
        $this->addMember($approvedCommunity2->id, $member->id, 'member', $communityOwner->id);
        $this->addMember($approvedCommunity2->id, $member3->id, 'volunteer', $communityOwner->id);
        $this->addMember($approvedCommunity3->id, $member->id, 'member', $communityOwner->id);
        $this->addMember($gamingCommunity->id, $member->id, 'volunteer', $owner2->id);
        $this->addMember($gamingCommunity->id, $superadmin->id, 'admin', $owner2->id);
        $this->addMember($gamingCommunity->id, $member2->id, 'member', $owner2->id);
        $this->addMember($approvedCommunity4->id, $member3->id, 'member', $owner2->id);

        // Banned member
        CommunityMember::create([
            'community_id' => $gamingCommunity->id,
            'user_id' => $member3->id,
            'role' => 'member',
            'status' => 'banned',
            'banned_at' => Carbon::now()->subDays(10),
            'ban_reason' => 'Melanggar aturan komunitas',
            'joined_at' => Carbon::now()->subDays(60),
        ]);
        CommunityBan::create([
            'community_id' => $gamingCommunity->id,
            'user_id' => $member3->id,
            'banned_by' => $owner2->id,
            'reason' => 'Melanggar aturan komunitas',
            'banned_at' => Carbon::now()->subDays(10),
            'status' => 'active',
        ]);

        // ─── Brands ─────────────────────────────────────────
        $approvedBrand = Brand::create([
            'owner_id' => $brandOwner->id,
            'name' => 'TechCorp Indonesia',
            'slug' => 'techcorp-indonesia',
            'description' => 'Perusahaan teknologi terkemuka di Indonesia.',
            'industry' => 'Technology',
            'website' => 'https://techcorp.id',
            'instagram' => '@techcorp_id',
            'contact_person' => 'Brand Owner',
            'contact_email' => 'brand@komuna.id',
            'contact_phone' => '08123456789',
            'status' => 'approved',
        ]);

        $pendingBrand = Brand::create([
            'owner_id' => $brandOwner->id,
            'name' => 'Foodies Brand',
            'slug' => 'foodies-brand',
            'description' => 'Brand kuliner lokal.',
            'industry' => 'Food & Beverage',
            'status' => 'pending',
        ]);

        $rejectedBrand = Brand::create([
            'owner_id' => $brandOwner->id,
            'name' => 'Spam Brand',
            'slug' => 'spam-brand',
            'description' => 'Brand yang ditolak.',
            'industry' => 'Other',
            'status' => 'rejected',
        ]);

        BrandMember::create([
            'brand_id' => $approvedBrand->id,
            'user_id' => $brandStaff->id,
            'role' => 'staff',
            'status' => 'active',
            'permissions' => ['manage_campaigns'],
        ]);

        // ─── Campaigns ──────────────────────────────────────
        Campaign::create([
            'brand_id' => $approvedBrand->id,
            'created_by' => $brandOwner->id,
            'title' => 'Tech Education Campaign',
            'slug' => 'tech-education-campaign',
            'description' => 'Kampanye edukasi teknologi untuk komunitas.',
            'budget' => 5000000,
            'status' => 'active',
            'start_date' => Carbon::now()->subDays(30),
            'end_date' => Carbon::now()->addDays(60),
        ]);

        // ─── Events ─────────────────────────────────────────
        $freeEvent = Event::create([
            'community_id' => $approvedCommunity1->id,
            'title' => 'Laravel Meetup Bandung',
            'slug' => 'laravel-meetup-bandung',
            'description' => 'Meetup bulanan komunitas Laravel Bandung.',
            'event_type' => 'free',
            'location_type' => 'offline',
            'location_address' => 'Jl. Gatot Subroto No. 1, Bandung',
            'start_datetime' => Carbon::now()->addDays(14),
            'end_datetime' => Carbon::now()->addDays(14)->addHours(4),
            'capacity' => 100,
            'price' => 0,
            'platform_fee' => 0,
            'admin_fee' => 0,
            'registration_status' => 'open',
            'approval_status' => 'approved',
            'visibility' => 'public',
        ]);

        $paidEvent = Event::create([
            'community_id' => $approvedCommunity1->id,
            'title' => 'Laravel Advanced Workshop',
            'slug' => 'laravel-advanced-workshop',
            'description' => 'Workshop Laravel advanced: Queue, Events, Notification.',
            'event_type' => 'paid',
            'location_type' => 'offline',
            'location_address' => 'Gedung Tech Park, Bandung',
            'start_datetime' => Carbon::now()->addDays(21),
            'end_datetime' => Carbon::now()->addDays(21)->addHours(8),
            'capacity' => 50,
            'price' => 150000,
            'platform_fee' => 10,
            'admin_fee' => 5000,
            'registration_status' => 'open',
            'approval_status' => 'approved',
            'visibility' => 'public',
        ]);

        $paidEventDiscount = Event::create([
            'community_id' => $approvedCommunity2->id,
            'title' => 'React Workshop Jakarta',
            'slug' => 'react-workshop-jakarta',
            'description' => 'Workshop React.js untuk pemula sampai menengah.',
            'event_type' => 'paid',
            'location_type' => 'hybrid',
            'location_address' => 'Convention Hall Jakarta',
            'start_datetime' => Carbon::now()->addDays(10),
            'end_datetime' => Carbon::now()->addDays(10)->addHours(6),
            'capacity' => 80,
            'price' => 200000,
            'platform_fee' => 10,
            'admin_fee' => 10000,
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'registration_status' => 'open',
            'approval_status' => 'approved',
            'visibility' => 'public',
        ]);

        $onlineEvent = Event::create([
            'community_id' => $approvedCommunity5->id,
            'title' => 'Virtual Running Challenge',
            'slug' => 'virtual-running-challenge',
            'description' => 'Challenge lari virtual selama 30 hari.',
            'event_type' => 'free',
            'location_type' => 'online',
            'start_datetime' => Carbon::now()->addDays(7),
            'end_datetime' => Carbon::now()->addDays(37),
            'capacity' => 200,
            'price' => 0,
            'registration_status' => 'open',
            'approval_status' => 'approved',
            'visibility' => 'public',
        ]);

        $pendingEvent = Event::create([
            'community_id' => $approvedCommunity1->id,
            'title' => 'Laravel Conference 2025',
            'slug' => 'laravel-conference-2025',
            'description' => 'Konferensi tahunan Laravel Indonesia.',
            'event_type' => 'paid',
            'location_type' => 'offline',
            'start_datetime' => Carbon::now()->addDays(60),
            'end_datetime' => Carbon::now()->addDays(62),
            'capacity' => 500,
            'price' => 500000,
            'platform_fee' => 10,
            'registration_status' => 'open',
            'approval_status' => 'pending',
            'visibility' => 'public',
        ]);

        // ─── Event Registrations ────────────────────────────
        $reg1 = EventRegistration::create([
            'event_id' => $freeEvent->id,
            'user_id' => $member->id,
            'status' => 'registered',
            'payment_status' => null,
            'registered_at' => Carbon::now()->subDays(5),
        ]);

        $reg2 = EventRegistration::create([
            'event_id' => $paidEvent->id,
            'user_id' => $member->id,
            'status' => 'registered',
            'payment_status' => 'waiting_confirmation',
            'registered_at' => Carbon::now()->subDays(3),
        ]);

        $reg3 = EventRegistration::create([
            'event_id' => $paidEvent->id,
            'user_id' => $member2->id,
            'status' => 'registered',
            'payment_status' => 'paid',
            'registered_at' => Carbon::now()->subDays(7),
        ]);

        $reg4 = EventRegistration::create([
            'event_id' => $paidEventDiscount->id,
            'user_id' => $member->id,
            'status' => 'registered',
            'payment_status' => 'paid',
            'registered_at' => Carbon::now()->subDays(2),
        ]);

        // ─── Payment Confirmations ──────────────────────────
        $payment1 = EventPaymentConfirmation::create([
            'event_registration_id' => $reg2->id,
            'proof_image' => 'proof/payments/sample-1.jpg',
            'amount_paid' => 150000,
            'bank_name' => 'Bank BCA',
            'account_name' => 'Member User',
            'status' => 'pending',
        ]);

        EventPaymentConfirmation::create([
            'event_registration_id' => $reg3->id,
            'proof_image' => 'proof/payments/sample-2.jpg',
            'amount_paid' => 150000,
            'bank_name' => 'Bank Mandiri',
            'account_name' => 'Sari Member',
            'status' => 'confirmed',
            'confirmed_at' => Carbon::now()->subDays(5),
        ]);

        EventPaymentConfirmation::create([
            'event_registration_id' => $reg4->id,
            'proof_image' => 'proof/payments/sample-3.jpg',
            'amount_paid' => 160000,
            'bank_name' => 'Bank BRI',
            'account_name' => 'Member User',
            'status' => 'confirmed',
            'confirmed_at' => Carbon::now()->subDays(1),
        ]);

        // ─── Platform Fees ──────────────────────────────────
        PlatformFee::create([
            'event_id' => $paidEvent->id,
            'event_registration_id' => $reg3->id,
            'event_payment_confirmation_id' => $payment1->id,
            'gross_amount' => 150000,
            'platform_fee_amount' => 15000,
            'community_net_amount' => 135000,
            'platform_fee_percent' => 10,
            'status' => 'recorded',
        ]);

        // ─── Event Chats ────────────────────────────────────
        $chat1 = EventChat::create([
            'event_id' => $freeEvent->id,
            'created_by' => $communityOwner->id,
            'title' => 'Informasi Lokasi Meetup',
            'message' => 'Halo semua! Meetup akan diadakan di Gedung Tech Park. Silakan datang tepat waktu.',
            'is_pinned' => true,
        ]);

        EventChatThread::create([
            'event_chat_id' => $chat1->id,
            'created_by' => $member->id,
            'message' => 'Terima kasih infonya! Apakah ada parkir?',
            'status' => 'approved',
        ]);

        EventChatThread::create([
            'event_chat_id' => $chat1->id,
            'created_by' => $member2->id,
            'message' => 'Saya ingin bertanya soal materi workshop.',
            'status' => 'pending',
        ]);

        // ─── Collaboration Requests ─────────────────────────
        CollaborationRequest::create([
            'brand_id' => $approvedBrand->id,
            'community_id' => $approvedCommunity1->id,
            'created_by' => $brandOwner->id,
            'collaboration_type' => 'event_sponsorship',
            'title' => 'Sponsorship Laravel Meetup',
            'proposal' => 'TechCorp ingin mensponsori meetup Laravel dengan menyediakan hadiah dan doorprize.',
            'budget' => 5000000,
            'event_date' => Carbon::now()->addDays(14)->toDateString(),
            'contact_person' => 'Brand Owner',
            'contact_email' => 'brand@komuna.id',
            'status' => 'pending',
        ]);

        CollaborationRequest::create([
            'brand_id' => $approvedBrand->id,
            'community_id' => $approvedCommunity2->id,
            'created_by' => $brandOwner->id,
            'collaboration_type' => 'event_sponsorship',
            'title' => 'React Workshop Sponsorship',
            'proposal' => 'Sponsorship untuk workshop React.',
            'budget' => 3000000,
            'event_date' => Carbon::now()->addDays(10)->toDateString(),
            'status' => 'accepted',
            'response_notes' => 'Diterima, terima kasih.',
            'responded_at' => Carbon::now()->subDays(3),
        ]);

        CollaborationRequest::create([
            'brand_id' => $approvedBrand->id,
            'community_id' => $gamingCommunity->id,
            'created_by' => $brandOwner->id,
            'collaboration_type' => 'content_collaboration',
            'title' => 'Gaming Tournament Collab',
            'proposal' => 'Kolaborasi untuk turnamen gaming.',
            'budget' => 2000000,
            'status' => 'rejected',
            'response_notes' => 'Tidak sesuai dengan niche komunitas.',
            'responded_at' => Carbon::now()->subDays(1),
        ]);

        // ─── Donations ──────────────────────────────────────
        Donation::create([
            'donor_id' => $member->id,
            'donation_type' => 'community_donation',
            'amount' => 50000,
            'message' => 'Semangat untuk komunitas Laravel!',
            'status' => 'confirmed',
            'community_id' => $approvedCommunity1->id,
            'confirmed_at' => Carbon::now()->subDays(2),
        ]);

        Donation::create([
            'donor_id' => $member2->id,
            'donation_type' => 'community_donation',
            'amount' => 100000,
            'message' => 'Donasi untuk pengembangan komunitas.',
            'status' => 'pending',
            'community_id' => $approvedCommunity1->id,
        ]);

        Donation::create([
            'donor_id' => $member->id,
            'donation_type' => 'event_donation',
            'amount' => 25000,
            'message' => 'Semoga event-nya sukses!',
            'status' => 'pending',
            'event_id' => $freeEvent->id,
            'community_id' => $approvedCommunity1->id,
        ]);

        Donation::create([
            'donor_id' => $member3->id,
            'donation_type' => 'event_donation',
            'amount' => 75000,
            'message' => 'Donasi untuk workshop.',
            'status' => 'confirmed',
            'event_id' => $paidEvent->id,
            'community_id' => $approvedCommunity1->id,
            'confirmed_at' => Carbon::now()->subDays(1),
        ]);

        Donation::create([
            'donor_id' => $member->id,
            'donation_type' => 'community_donation',
            'amount' => 30000,
            'message' => 'Untuk komunitas Gaming Indonesia.',
            'status' => 'rejected',
            'community_id' => $gamingCommunity->id,
            'admin_notes' => 'Donasi ditolak karena kurang lengkap.',
        ]);

        // ─── Wallet Transactions ────────────────────────────
        $walletService->credit($member, 250000, 'Welcome bonus', 'manual_adjustment');
        $walletService->credit($member, 50000, 'Reward event participation', 'manual_adjustment');
        $walletService->debit($member, 15000, 'Event registration fee', 'manual_adjustment');

        $walletService->credit($communityOwner, 500000, 'Initial community fund', 'manual_adjustment');
        $walletService->credit($communityOwner, 150000, 'Event income: Laravel Workshop', 'event_income');

        $walletService->credit($brandOwner, 1000000, 'CSR budget allocation', 'manual_adjustment');
        $walletService->credit($brandOwner, 250000, 'Brand collaboration income', 'manual_adjustment');

        $walletService->credit($member2, 100000, 'Welcome bonus', 'manual_adjustment');
        $walletService->credit($member3, 75000, 'Welcome bonus', 'manual_adjustment');

        $walletService->credit($gamingCommunity->owner, 300000, 'Community fund', 'manual_adjustment');

        // ─── Approval Logs ──────────────────────────────────
        ApprovalLog::create([
            'reviewed_by' => $superadmin->id,
            'type' => 'community',
            'approvable_id' => $approvedCommunity1->id,
            'approvable_type' => Community::class,
            'action' => 'approved',
            'notes' => 'Komunitas memenuhi syarat.',
        ]);
        ApprovalLog::create([
            'reviewed_by' => $superadmin->id,
            'type' => 'brand',
            'approvable_id' => $approvedBrand->id,
            'approvable_type' => Brand::class,
            'action' => 'approved',
            'notes' => 'Brand valid.',
        ]);
        ApprovalLog::create([
            'reviewed_by' => $superadmin->id,
            'type' => 'community',
            'approvable_id' => $rejectedCommunity->id,
            'approvable_type' => Community::class,
            'action' => 'rejected',
            'notes' => 'Tidak memenuhi pedoman komunitas.',
        ]);

        $this->command->info('Database seeder completed successfully!');
        $this->command->info('Demo accounts:');
        $this->command->info('  superadmin@komuna.id / password');
        $this->command->info('  member@komuna.id / password');
        $this->command->info('  community@komuna.id / password');
        $this->command->info('  brand@komuna.id / password');
    }

    private function createUser(string $name, string $email, string $role, string $username, string $bio, string $city, string $province): User
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
            ]
        );

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'username' => $username,
                'bio' => $bio,
                'city' => $city,
                'province' => $province,
                'phone' => '08' . rand(1000000000, 9999999999),
            ]
        );

        if (!$user->hasRole($role)) {
            $user->assignRole($role);
        }

        return $user;
    }

    private function addMember(int $communityId, int $userId, string $role, int $assignedBy): void
    {
        $existing = CommunityMember::where('community_id', $communityId)
            ->where('user_id', $userId)
            ->first();

        if (!$existing) {
            CommunityMember::create([
                'community_id' => $communityId,
                'user_id' => $userId,
                'role' => $role,
                'status' => 'active',
                'joined_at' => Carbon::now()->subDays(rand(10, 60)),
            ]);

            MemberJoinHistory::create([
                'community_id' => $communityId,
                'user_id' => $userId,
                'action' => 'joined',
                'acted_at' => Carbon::now()->subDays(rand(10, 60)),
            ]);

            if ($role !== 'member') {
                CommunityMemberRole::create([
                    'community_id' => $communityId,
                    'user_id' => $userId,
                    'role' => $role,
                    'assigned_by' => $assignedBy,
                    'assigned_at' => Carbon::now()->subDays(rand(5, 30)),
                ]);
            }
        }
    }
}
