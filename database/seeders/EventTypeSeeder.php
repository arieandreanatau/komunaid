<?php

namespace Database\Seeders;

use App\Models\EventType;
use Illuminate\Database\Seeder;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Seminar', 'slug' => 'seminar', 'description' => 'Seminar dan presentasi'],
            ['name' => 'Workshop', 'slug' => 'workshop', 'description' => 'Workshop praktis'],
            ['name' => 'Gathering', 'slug' => 'gathering', 'description' => 'Kumpul dan silaturahmi'],
            ['name' => 'Volunteer', 'slug' => 'volunteer', 'description' => 'Kegiatan sukarela'],
            ['name' => 'Charity', 'slug' => 'charity', 'description' => 'Kegiatan amal'],
            ['name' => 'Competition', 'slug' => 'competition', 'description' => 'Kompetisi dan lomba'],
            ['name' => 'Discussion', 'slug' => 'discussion', 'description' => 'Diskusi dan forum'],
            ['name' => 'Exhibition', 'slug' => 'exhibition', 'description' => 'Pameran dan showcase'],
            ['name' => 'Online Event', 'slug' => 'online-event', 'description' => 'Event daring'],
        ];

        foreach ($types as $type) {
            EventType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}
