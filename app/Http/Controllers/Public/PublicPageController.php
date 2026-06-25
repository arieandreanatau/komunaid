<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;

class PublicPageController extends Controller
{
    public function show(string $key)
    {
        $page = CmsPage::where('key', $key)
            ->where(function ($q) {
                $q->where('status', 'published')
                    ->orWhere('is_published', true);
            })
            ->first();

        if (!$page) {
            $page = (object) [
                'key' => $key,
                'title' => $this->getDefaultTitle($key),
                'content' => $this->getDefaultContent($key),
                'meta_title' => null,
                'meta_description' => null,
            ];
        }

        return view('public.about', compact('page'));
    }

    private function getDefaultTitle(string $key): string
    {
        return match ($key) {
            'about' => 'Tentang KomunaID',
            'terms' => 'Syarat & Ketentuan',
            'privacy' => 'Kebijakan Privasi',
            default => ucfirst($key),
        };
    }

    private function getDefaultContent(string $key): ?string
    {
        return match ($key) {
            'about' => '<p>KomunaID adalah platform komunitas yang membantu masyarakat menemukan komunitas, mengelola kegiatan, dan membuka peluang kolaborasi antara komunitas, brand, dan perusahaan.</p>
            <p>Kami percaya bahwa setiap orang berhak menemukan komunitas yang sesuai dengan minat dan passion mereka. Melalui KomunaID, kami ingin membangun ekosistem kolaborasi yang inklusif dan berdampak positif bagi masyarakat Indonesia.</p>',
            'terms' => '<p>Syarat dan ketentuan akan segera tersedia.</p>',
            'privacy' => '<p>Kebijakan privasi akan segera tersedia.</p>',
            default => null,
        };
    }
}
