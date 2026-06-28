<?php

declare(strict_types=1);

namespace App\Services\Simplified;

use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\CompanyMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EntitySubmissionService
{
    public function __construct(
        private AuditLogService $audit,
        private NotificationService $notifications,
    ) {}

    public function submitCommunity(User $user, array $data, ?Request $request = null): Community
    {
        $community = Community::create([
            'owner_id' => $user->id,
            'category_id' => $data['category_id'] ?? null,
            'name' => $data['community_name'],
            'slug' => Str::slug($data['community_name']).'-'.Str::lower(Str::random(6)),
            'description' => $data['description'] ?? null,
            'address' => $data['address'] ?? null,
            'contact_email' => $data['contact_email'] ?? null,
            'contact_phone' => $data['contact_phone'] ?? null,
            'logo' => $data['logo'] ?? null,
            'banner' => $data['banner'] ?? null,
            'social_media' => $data['social_media'] ?? null,
            'city' => $data['city'] ?? null,
            'province' => $data['province'] ?? null,
            'status' => 'pending_approval',
            'submitted_at' => now(),
        ]);

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'owner_candidate',
            'status' => 'pending',
        ]);

        $this->notifications->notifyAdmins(
            'community_submitted',
            'Pengajuan Komunitas Baru',
            "{$user->name} mengajukan komunitas: {$community->name}",
            ['community_id' => $community->id]
        );

        $this->notifications->notifyUser(
            $user,
            'community_submitted',
            'Pengajuan Komunitas Diterima',
            'Pengajuan komunitas berhasil dikirim dan sedang menunggu approval admin KomunaID.',
            ['community_id' => $community->id]
        );

        $this->audit->log(
            actorId: $user->id,
            action: 'community_submitted',
            subject: $community,
            newValues: ['name' => $community->name, 'status' => 'pending_approval'],
            request: $request,
        );

        return $community;
    }

    public function submitBrand(User $user, array $data, ?Request $request = null): Brand
    {
        $brand = Brand::create([
            'owner_id' => $user->id,
            'company_id' => $data['company_id'] ?? null,
            'name' => $data['brand_name'],
            'slug' => Str::slug($data['brand_name']).'-'.Str::lower(Str::random(6)),
            'industry' => $data['industry'] ?? null,
            'description' => $data['brand_description'] ?? null,
            'website' => $data['website'] ?? null,
            'logo' => $data['logo'] ?? null,
            'banner' => $data['banner'] ?? null,
            'contact_email' => $data['contact_email'] ?? null,
            'contact_phone' => $data['contact_phone'] ?? null,
            'status' => 'pending_approval',
            'submitted_at' => now(),
        ]);

        BrandMember::create([
            'brand_id' => $brand->id,
            'user_id' => $user->id,
            'role' => 'owner_candidate',
            'status' => 'pending',
        ]);

        $this->notifications->notifyAdmins(
            'brand_submitted',
            'Pengajuan Brand Baru',
            "{$user->name} mengajukan brand: {$brand->name}",
            ['brand_id' => $brand->id]
        );

        $this->notifications->notifyUser(
            $user,
            'brand_submitted',
            'Pengajuan Brand Diterima',
            'Pengajuan brand berhasil dikirim dan sedang menunggu approval admin KomunaID.',
            ['brand_id' => $brand->id]
        );

        $this->audit->log(
            actorId: $user->id,
            action: 'brand_submitted',
            subject: $brand,
            newValues: ['name' => $brand->name, 'status' => 'pending_approval'],
            request: $request,
        );

        return $brand;
    }

    public function submitCompany(User $user, array $data, ?Request $request = null): Company
    {
        $company = Company::create([
            'owner_id' => $user->id,
            'name' => $data['company_name'],
            'slug' => Str::slug($data['company_name']).'-'.Str::lower(Str::random(6)),
            'industry' => $data['industry'] ?? null,
            'description' => $data['description'] ?? null,
            'website_url' => $data['website'] ?? null,
            'logo_path' => $data['logo'] ?? null,
            'legal_name' => $data['legal_name'] ?? null,
            'tax_number' => $data['tax_number'] ?? null,
            'address' => $data['address'] ?? null,
            'email' => $data['contact_email'] ?? null,
            'phone' => $data['contact_phone'] ?? null,
            'status' => 'pending_approval',
            'submitted_at' => now(),
        ]);

        CompanyMember::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'role' => 'owner_candidate',
            'status' => 'pending',
        ]);

        $this->notifications->notifyAdmins(
            'company_submitted',
            'Pengajuan Perusahaan Baru',
            "{$user->name} mengajukan perusahaan: {$company->name}",
            ['company_id' => $company->id]
        );

        $this->notifications->notifyUser(
            $user,
            'company_submitted',
            'Pengajuan Perusahaan Diterima',
            'Pengajuan perusahaan berhasil dikirim dan sedang menunggu approval admin KomunaID.',
            ['company_id' => $company->id]
        );

        $this->audit->log(
            actorId: $user->id,
            action: 'company_submitted',
            subject: $company,
            newValues: ['name' => $company->name, 'status' => 'pending_approval'],
            request: $request,
        );

        return $company;
    }
}
