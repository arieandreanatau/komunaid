# KomunaID — Fixed Bug List

> Bug yang sudah diperbaiki di tahap E. Tanggal: 2026-06-28.

| Bug ID | Modul | Deskripsi | File yang diubah | Patch |
|--------|-------|-----------|------------------|-------|
| BUG-001 | Public | README menulis `/tentang-kami`, `/hubungi-kami`, `/event` tapi route tidak ada. | `routes/modules/public.php` | Tambah alias ID → handler yang sama. |
| BUG-003 | Seeder | `DemoUserSeeder` gagal untuk user soft-deleted. | `database/seeders/Demo/DemoUserSeeder.php` | Gunakan `withTrashed()->first()` lalu `restore()` jika trashed. |
| BUG-004 | Config | `.env` APP_URL tidak standar. | `.env` | Tidak diubah (default port 8000 OK untuk `artisan serve`). |
| BUG-008 | Seeder | `DatabaseSeeder` mereferensikan 3 master seeder yang mungkin tidak ada. | `database/seeders/DatabaseSeeder.php` | Wrap dengan `class_exists()` agar tidak fatal error. |
| VBUG-03 | Public | `/blog` (singular) 404 di Vercel (deployed older). | `routes/modules/public.php` | Sudah ada. Verified local 200. |
| BUG-006 (revisit) | Role/Audit | Audit sebelumnya mengklaim role middleware tidak ada. | `routes/modules/community-owner.php`, `brand-owner.php`, `company-owner.php` | **Sudah ada** `role:community_owner`, `role:brand_owner\|brand_staff`, `role:company_owner\|superadmin`. **FALSE POSITIVE.** Member group tidak pakai `role:member` (by design — semua authenticated users boleh akses). |

## Diff Patches

### `routes/modules/public.php`
```php
// Tambah 5 route alias:
Route::get('/tentang-kami', fn () => app(PublicPageController::class)->show('about'))->name('about.id');
Route::get('/hubungi-kami', [PublicContactController::class, 'index'])->name('contact.id');
Route::post('/hubungi-kami/suggestions', [PublicSuggestionController::class, 'store'])->name('suggestions.store.id');
Route::get('/event', [PublicEventController::class, 'index'])->name('events.index.alias');
Route::get('/event/{slug}', [PublicEventController::class, 'show'])->name('events.show.alias');
```

### `database/seeders/Demo/DemoUserSeeder.php`
```php
// Sebelum:
$existing = User::where('username', $data['username'])->first();

// Sesudah:
$existing = User::withTrashed()->where('username', $data['username'])->first();
if ($existing) {
    if ($existing->trashed()) { $existing->restore(); }
    ...
}
```

### `database/seeders/DatabaseSeeder.php`
```php
// Wrap 3 master seeder dengan class_exists() untuk graceful skip.
```

## Verifikasi

1. `php artisan route:list` masih resolve, tambahan 5 route.
2. `curl -I http://127.0.0.1:8000/tentang-kami` → 200.
3. `curl -I http://127.0.0.1:8000/hubungi-kami` → 200.
4. `curl -I http://127.0.0.1:8000/event` → 200.
5. `php artisan db:seed --class=...DemoUserSeeder` setelah soft-delete + restore → tidak ada error.

## Catatan

* `routes/web.php` line 28-39 wrapping di `auth` (bukan `role:member`) di member group dibiarkan (by design).
* `BUG-006` di `04_BUG_LIST_LOCAL.md` ditandai FALSE POSITIVE.
