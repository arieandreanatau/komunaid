<?php

namespace Database\Seeders\Demo;

use App\Models\Brand;
use App\Models\Community;
use App\Models\CollaborationProposal;
use App\Models\CollaborationType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoCollaborationSeeder extends Seeder
{
    public function run(): void
    {
        $brandOwner = User::where('email', 'brand.owner@komuna.test')->first();
        $communityOwner = User::where('email', 'community.owner@komuna.test')->first();

        if (!$brandOwner || !$communityOwner) {
            $this->command->warn('DemoUserSeeder must run first. Skipping DemoCollaborationSeeder.');
            return;
        }

        $bukuKita = Brand::where('slug', Str::slug('BukuKita'))->first();
        $sportify = Brand::where('slug', Str::slug('Sportify Local'))->first();
        $kopi = Brand::where('slug', Str::slug('Kopi Komunitas'))->first();

        $bookParty = Community::where('slug', Str::slug('Jakarta Book Party'))->first();
        $urbanRunner = Community::where('slug', Str::slug('Komunitas Urban Runner'))->first();
        $volunteerCommunity = Community::where('slug', Str::slug('Komunitas Volunteer Sosial'))->first();

        if (!$bukuKita || !$bookParty) {
            $this->command->warn('Demo brand/community data missing. Skipping DemoCollaborationSeeder.');
            return;
        }

        $sponsorshipType = CollaborationType::where('slug', 'sponsorship')->first();
        $productSupportType = CollaborationType::where('slug', 'product-support')->first();
        $mediaPartnerType = CollaborationType::where('slug', 'media-partner')->first();

        if ($bukuKita && $bookParty) {
            CollaborationProposal::updateOrCreate(
                ['title' => 'Proposal Sponsorship Book Party'],
                [
                    'proposer_type' => Brand::class,
                    'proposer_id' => $bukuKita->id,
                    'target_type' => Community::class,
                    'target_id' => $bookParty->id,
                    'collaboration_type_id' => $sponsorshipType?->id,
                    'title' => 'Proposal Sponsorship Book Party',
                    'description' => 'BukuKita ingin menjadi sponsor utama untuk acara Book Party bulanan Jakarta Book Party.',
                    'objective' => 'Meningkatkan brand awareness BukuKita di kalangan komunitas literasi.',
                    'target_audience' => 'Pecinta buku dan literasi di Jakarta',
                    'benefit_for_brand' => 'Branding di setiap acara, distribusi pamflet, shoutout di social media',
                    'benefit_for_community' => 'Dana sponsor Rp 5.000.000/bulan, pasokan buku untuk giveaway',
                    'estimated_budget' => 5000000,
                    'timeline' => '6 bulan',
                    'status' => 'sent',
                    'sent_at' => now()->subDays(3),
                    'created_by' => $brandOwner->id,
                ]
            );
        }

        if ($sportify && $urbanRunner) {
            CollaborationProposal::updateOrCreate(
                ['title' => 'Proposal Product Support Charity Run'],
                [
                    'proposer_type' => Brand::class,
                    'proposer_id' => $sportify->id,
                    'target_type' => Community::class,
                    'target_id' => $urbanRunner->id,
                    'collaboration_type_id' => $productSupportType?->id,
                    'title' => 'Proposal Product Support Charity Run',
                    'description' => 'Sportify Local menyediakan perlengkapan olahraga untuk Charity Run.',
                    'objective' => 'Mendukung kegiatan amal sekaligus mempromosikan produk sport lokal.',
                    'target_audience' => 'Komunitas pelari dan olahraga di Jakarta',
                    'benefit_for_brand' => 'Product placement, booth di event, sampling produk',
                    'benefit_for_community' => 'Perlengkapan olahraga gratis untuk peserta',
                    'estimated_budget' => 10000000,
                    'timeline' => '3 bulan',
                    'status' => 'accepted',
                    'sent_at' => now()->subDays(10),
                    'reviewed_by' => $communityOwner->id,
                    'reviewed_at' => now()->subDays(5),
                    'response_note' => 'Diterima dengan senang hati. Mari koordinasi lebih lanjut.',
                    'created_by' => $brandOwner->id,
                ]
            );
        }

        if ($kopi && $volunteerCommunity) {
            CollaborationProposal::updateOrCreate(
                ['title' => 'Proposal Media Partner Volunteer Trip'],
                [
                    'proposer_type' => Brand::class,
                    'proposer_id' => $kopi->id,
                    'target_type' => Community::class,
                    'target_id' => $volunteerCommunity->id,
                    'collaboration_type_id' => $mediaPartnerType?->id,
                    'title' => 'Proposal Media Partner Volunteer Trip',
                    'description' => 'Kopi Komunitas ingin menjadi media partner untuk Volunteer Trip.',
                    'objective' => 'Mendokumentasikan kegiatan volunteer dan membagikan cerita inspiratif.',
                    'target_audience' => 'Komunitas sosial dan volunteer',
                    'benefit_for_brand' => 'Konten dokumentasi, social media coverage',
                    'benefit_for_community' => 'Dokumentasi profesional, kopi gratis untuk volunteer',
                    'estimated_budget' => 2000000,
                    'timeline' => '1 bulan',
                    'status' => 'draft',
                    'created_by' => $brandOwner->id,
                ]
            );
        }
    }
}
