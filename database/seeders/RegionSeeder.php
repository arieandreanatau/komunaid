<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $indonesia = Region::updateOrCreate(
            ['slug' => 'indonesia'],
            ['name' => 'Indonesia', 'type' => 'country', 'is_active' => true]
        );

        $provinces = [
            ['name' => 'DKI Jakarta', 'slug' => 'dki-jakarta', 'type' => 'province'],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat', 'type' => 'province'],
            ['name' => 'Banten', 'slug' => 'banten', 'type' => 'province'],
            ['name' => 'Jawa Tengah', 'slug' => 'jawa-tengah', 'type' => 'province'],
            ['name' => 'Jawa Timur', 'slug' => 'jawa-timur', 'type' => 'province'],
            ['name' => 'DI Yogyakarta', 'slug' => 'di-yogyakarta', 'type' => 'province'],
        ];

        $provinceModels = [];
        foreach ($provinces as $p) {
            $provinceModels[$p['slug']] = Region::updateOrCreate(
                ['slug' => $p['slug']],
                ['name' => $p['name'], 'parent_id' => $indonesia->id, 'type' => $p['type'], 'is_active' => true]
            );
        }

        $cities = [
            ['name' => 'Jakarta Selatan', 'slug' => 'jakarta-selatan', 'type' => 'city', 'parent' => 'dki-jakarta'],
            ['name' => 'Jakarta Pusat', 'slug' => 'jakarta-pusat', 'type' => 'city', 'parent' => 'dki-jakarta'],
            ['name' => 'Jakarta Timur', 'slug' => 'jakarta-timur', 'type' => 'city', 'parent' => 'dki-jakarta'],
            ['name' => 'Jakarta Barat', 'slug' => 'jakarta-barat', 'type' => 'city', 'parent' => 'dki-jakarta'],
            ['name' => 'Jakarta Utara', 'slug' => 'jakarta-utara', 'type' => 'city', 'parent' => 'dki-jakarta'],
            ['name' => 'Bandung', 'slug' => 'bandung', 'type' => 'city', 'parent' => 'jawa-barat'],
            ['name' => 'Tangerang', 'slug' => 'tangerang', 'type' => 'city', 'parent' => 'banten'],
            ['name' => 'Bekasi', 'slug' => 'bekasi', 'type' => 'city', 'parent' => 'jawa-barat'],
            ['name' => 'Depok', 'slug' => 'depok', 'type' => 'city', 'parent' => 'jawa-barat'],
        ];

        foreach ($cities as $city) {
            $parentId = $provinceModels[$city['parent']]?->id ?? $indonesia->id;
            Region::updateOrCreate(
                ['slug' => $city['slug']],
                ['name' => $city['name'], 'parent_id' => $parentId, 'type' => $city['type'], 'is_active' => true]
            );
        }
    }
}
