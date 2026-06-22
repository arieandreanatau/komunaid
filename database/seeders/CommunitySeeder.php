<?php

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunityCategory;
use App\Models\CommunityMember;
use App\Models\MemberJoinHistory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $categories = CommunityCategory::pluck('id', 'slug');

        $communityOwner = User::where('email', 'community@komuna.id')->first();
        $member = User::where('email', 'member@komuna.id')->first();

        $communities = [
            [
                'category_id' => $categories['teknologi'] ?? 1,
                'owner_id' => $communityOwner->id,
                'name' => 'Laravel Indonesia',
                'description' => 'Komunitas pengembang Laravel di Indonesia. Berbagi ilmu, tips, dan trik seputar Laravel framework.',
                'about' => 'Laravel Indonesia adalah komunitas terbesar untuk pengembang Laravel di Indonesia. Kami rutin mengadakan meetup, workshop, dan sharing session.',
                'region' => 'Jawa Barat',
                'city' => 'Bandung',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['teknologi'] ?? 1,
                'owner_id' => $communityOwner->id,
                'name' => 'React Jakarta',
                'description' => 'Komunitas React.js developer di Jakarta. Belajar bareng, project bareng.',
                'about' => 'React Jakarta adalah komunitas yang berfokus pada React.js dan ekosistemnya.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['bisnis-startup'] ?? 2,
                'owner_id' => $communityOwner->id,
                'name' => 'Startup Bandung',
                'description' => 'Komunitas startup founder dan aspiring entrepreneur di Bandung.',
                'about' => 'Startup Bandung hadir untuk menghubungkan para founder, investor, dan talent di ekosistem startup Bandung.',
                'region' => 'Jawa Barat',
                'city' => 'Bandung',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['desain-kreatif'] ?? 3,
                'owner_id' => $communityOwner->id,
                'name' => 'UI/UX Surabaya',
                'description' => 'Komunitas desainer UI/UX di Surabaya. Diskusi design system, prototyping, dan user research.',
                'about' => 'Kami adalah komunitas desainer UI/UX yang aktif di Surabaya dengan agenda rutin bulanan.',
                'region' => 'Jawa Timur',
                'city' => 'Surabaya',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['olahraga'] ?? 4,
                'owner_id' => $communityOwner->id,
                'name' => 'Running Jakarta',
                'description' => 'Komunitas pelari di Jakarta. Running setiap weekend di car free day.',
                'about' => 'Running Jakarta mengadakan lari rutin setiap Minggu pagi di berbagai lokasi di Jakarta.',
                'region' => 'DKI Jakarta',
                'city' => 'Jakarta',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['teknologi'] ?? 1,
                'owner_id' => $communityOwner->id,
                'name' => 'DevOps Indonesia',
                'description' => 'Komunitas DevOps engineer Indonesia. Docker, Kubernetes, CI/CD, dan cloud.',
                'about' => 'DevOps Indonesia adalah komunitas praktisi DevOps untuk berbagi knowledge dan best practices.',
                'region' => 'Nasional',
                'city' => 'Online',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['kuliner'] ?? 8,
                'owner_id' => $communityOwner->id,
                'name' => 'Kuliner Jogja',
                'description' => 'Komunitas pencinta kuliner Jogja. Review, rekomendasi, dan food hunting.',
                'about' => 'Kuliner Jogja adalah komunitas yang berfokus pada eksplorasi kuliner di Yogyakarta.',
                'region' => 'DI Yogyakarta',
                'city' => 'Yogyakarta',
                'status' => 'approved',
                'is_public' => true,
            ],
            [
                'category_id' => $categories['pendidikan'] ?? 5,
                'owner_id' => $communityOwner->id,
                'name' => 'Belajar Data Science',
                'description' => 'Komunitas belajar data science dan machine learning untuk pemula.',
                'about' => 'Kami membantu pemula memulai journey di data science dengan mentorship dan project-based learning.',
                'region' => 'Nasional',
                'city' => 'Online',
                'status' => 'approved',
                'is_public' => true,
            ],
        ];

        foreach ($communities as $index => $data) {
            $community = Community::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                $data
            );

            if ($index < 3 && $member) {
                $existing = CommunityMember::where('community_id', $community->id)
                    ->where('user_id', $member->id)
                    ->first();

                if (!$existing) {
                    CommunityMember::create([
                        'community_id' => $community->id,
                        'user_id' => $member->id,
                        'role' => 'member',
                        'status' => 'active',
                        'joined_at' => Carbon::now()->subDays(rand(10, 60)),
                    ]);

                    MemberJoinHistory::create([
                        'community_id' => $community->id,
                        'user_id' => $member->id,
                        'action' => 'joined',
                        'acted_at' => Carbon::now()->subDays(rand(10, 60)),
                    ]);
                }
            }
        }
    }
}
