<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),
    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],
        'public' => [
            // Local in dev; set PUBLIC_DISK_DRIVER=s3 in production (Cloudflare R2).
            'driver' => env('PUBLIC_DISK_DRIVER', 'local'),
            // Local driver: filesystem root. s3/R2: key prefix inside the bucket
            // (empty so paths like communities/logos/x.jpg map 1:1 to bucket keys).
            'root' => env('PUBLIC_DISK_DRIVER', 'local') === 's3'
                ? env('PUBLIC_DISK_ROOT', '')
                : storage_path('app/public'),
            // In dev: APP_URL/storage. In prod: R2 public bucket URL via PUBLIC_DISK_URL.
            'url' => env('PUBLIC_DISK_URL', env('APP_URL').'/storage'),
            'visibility' => 'public',
            'throw' => false,
            // Cloudflare R2 (S3-compatible) — only used when PUBLIC_DISK_DRIVER=s3.
            'key' => env('R2_ACCESS_KEY_ID'),
            'secret' => env('R2_SECRET_ACCESS_KEY'),
            'region' => env('R2_DEFAULT_REGION', 'auto'),
            'bucket' => env('R2_BUCKET'),
            'endpoint' => env('R2_ENDPOINT'),
            'use_path_style_endpoint' => true,
        ],
    ],
    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
