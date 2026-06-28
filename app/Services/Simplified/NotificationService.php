<?php

declare(strict_types=1);

namespace App\Services\Simplified;

use App\Models\CustomNotification;
use App\Models\User;
use Spatie\Permission\Models\Role;

class NotificationService
{
    public function notifyUser(User $user, string $type, string $title, string $message, ?array $data = null): CustomNotification
    {
        return CustomNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public function notifyAdmins(string $type, string $title, string $message, ?array $data = null): int
    {
        $adminRoles = ['superadmin', 'admin_platform'];
        $adminIds = User::role($adminRoles)->pluck('id');

        if ($adminIds->isEmpty()) {
            // Fallback: notify first superadmin
            $first = Role::whereIn('name', $adminRoles)->first();
            if ($first) {
                $adminIds = User::role($first->name)->pluck('id');
            }
        }

        $count = 0;
        foreach ($adminIds as $adminId) {
            CustomNotification::create([
                'user_id' => $adminId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
            ]);
            $count++;
        }

        return $count;
    }
}
