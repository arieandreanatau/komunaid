<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Company;
use App\Models\BrandMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoBrandCompanySeeder extends Seeder
{
    public function run(): void
    {
        $brandOwner = User::where('email', 'brand.owner@komuna.test')->first();
        $companyOwner = User::where('email', 'company.owner@komuna.test')->first();

        if (!$brandOwner) {
            $this->command->warn('DemoUserSeeder must run first. Skipping DemoBrandCompanySeeder.');
            return;
        }

        $companies = [];

        if ($companyOwner) {
            $companies[] = Company::updateOrCreate(
                ['slug' => Str::slug('PT Komuna Demo Indonesia')],
                [
                    'owner_id' => $companyOwner->id,
                    'name' => 'PT Komuna Demo Indonesia',
                    'legal_name' => 'PT Komuna Demo Indonesia Tbk',
                    'industry' => 'Technology',
                    'description' => 'Perusahaan teknologi yang berfokus pada platform komunitas digital.',
                    'email' => 'info@komunademo.test',
                    'phone' => '+62215551234',
                    'city' => 'Jakarta',
                    'province' => 'DKI Jakarta',
                    'status' => 'active',
                    'created_by' => $companyOwner->id,
                ]
            );

            $companies[] = Company::updateOrCreate(
                ['slug' => Str::slug('PT Brand Nusantara Demo')],
                [
                    'owner_id' => $companyOwner->id,
                    'name' => 'PT Brand Nusantara Demo',
                    'legal_name' => 'PT Brand Nusantara Demo',
                    'industry' => 'Consumer Goods',
                    'description' => 'Perusahaan consumer goods dengan berbagai brand lokal.',
                    'email' => 'info@brandnusantara.test',
                    'phone' => '+62215555678',
                    'city' => 'Surabaya',
                    'province' => 'Jawa Timur',
                    'status' => 'active',
                    'created_by' => $companyOwner->id,
                ]
            );
        }

        $brands = [
            [
                'owner_id' => $brandOwner->id,
                'name' => 'Kopi Komunitas',
                'slug' => Str::slug('Kopi Komunitas'),
                'description' => 'Brand kopi lokal yang mendukung kegiatan komunitas.',
                'industry' => 'F&B',
                'email' => 'hello@kopikomunitas.test',
                'status' => 'active',
                'company_id' => $companies[0]?->id,
                'created_by' => $brandOwner->id,
            ],
            [
                'owner_id' => $brandOwner->id,
                'name' => 'BukuKita',
                'slug' => Str::slug('BukuKita'),
                'description' => 'Platform dan brand buku Indonesia.',
                'industry' => 'Buku/Edukasi',
                'email' => 'info@bukukita.test',
                'status' => 'active',
                'created_by' => $brandOwner->id,
            ],
            [
                'owner_id' => $brandOwner->id,
                'name' => 'Sportify Local',
                'slug' => Str::slug('Sportify Local'),
                'description' => 'Brand olahraga lokal Indonesia.',
                'industry' => 'Sport',
                'email' => 'info@sportifylocal.test',
                'status' => 'active',
                'company_id' => $companies[1]?->id,
                'created_by' => $brandOwner->id,
            ],
        ];

        foreach ($brands as $data) {
            Brand::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
