# KomunaID - Troubleshooting Guide

> Panduan mengatasi masalah umum saat menjalankan KomunaID.

---

## Daftar Isi

1. [Database Connection Refused](#1-database-connection-refused)
2. [Access Denied for Root](#2-access-denied-for-root)
3. [Migration Foreign Key Error](#3-migration-foreign-key-error)
4. [Class Not Found](#4-class-not-found)
5. [Route Not Found](#5-route-not-found)
6. [View Not Found](#6-view-not-found)
7. [Storage Image Tidak Tampil](#7-storage-image-tidak-tampil)
8. [npm run dev Error](#8-npm-run-dev-error)
9. [Port 8000 Dipakai](#9-port-8000-dipakai)
10. [Apache/MySQL XAMPP Tidak Start](#10-apachemysql-xampp-tidak-start)
11. [File Permission Error](#11-file-permission-error)
12. [Error Lainnya](#12-error-lainnya)

---

## 1. Database Connection Refused

### Pesan Error

```
SQLSTATE[HY000] [2002] Connection refused
```

### Penyebab

- MySQL belum dijalankan
- Port MySQL berubah (default: 3306)
- Konfigurasi `.env` salah

### Solusi

1. **Pastikan MySQL sudah jalan:**
   - Buka XAMPP Control Panel
   - Klik **Start** pada MySQL
   - Pastikan status **Running** (hijau)

2. **Cek port MySQL:**
   ```bash
   # Buka phpMyAdmin
   http://127.0.0.1/phpmyadmin
   ```
   - Klik tab **Variable**
   - Cari `port`
   - Pastikan sesuai dengan `.env` (biasanya `3306`)

3. **Cek file `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=komunaid_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Reset konfigurasi:**
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

---

## 2. Access Denied for Root

### Pesan Error

```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost' (using password: YES)
```

### Penyebab

- Password MySQL `root` salah
- Konfigurasi `.env` mengisi password padahal XAMPP default kosong

### Solusi

1. **Pastikan password kosong untuk XAMPP:**
   ```env
   DB_USERNAME=root
   DB_PASSWORD=
   ```

2. **Reset password root MySQL:**
   ```bash
   # Buka phpMyAdmin
   http://127.0.0.1/phpmyadmin
   ```
   - Klik tab **User accounts**
   - Klik **Edit privileges** pada user `root`
   - Klik tab **Change password**
   - Kosongkan password
   - Klik **Go**

3. **Atau via SQL:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   ```

---

## 3. Migration Foreign Key Error

### Pesan Error

```
SQLSTATE[HY000]: General error: 1215 Cannot add foreign key constraint
```

### Penyebab

- Urutan migration salah
- Tipe data kolom tidak cocok
- Kolom belum ada di tabel referensi

### Solusi

1. **Jalankan migration dengan verbose:**
   ```bash
   php artisan migrate -vvv
   ```
   Lihat error detail di output.

2. **Pastikan tipe data cocok:**
   - Kolom di tabel utama dan tabel referensi harus sama tipe datanya
   - Contoh: `unsignedBigInteger` harus cocok

3. **Cek urutan migration:**
   ```bash
   # Lihat file migration di database/migrations/
   ls database/migrations/
   ```

4. **Reset dan jalankan ulang:**
   ```bash
   php artisan migrate:fresh
   ```

5. **Jika masalah di production:**
   ```bash
   # Disable foreign key check
   php artisan tinker
   ```
   ```php
   DB::statement('SET FOREIGN_KEY_CHECKS=0');
   Artisan::call('migrate:fresh');
   DB::statement('SET FOREIGN_KEY_CHECKS=1');
   ```

---

## 4. Class Not Found

### Pesan Error

```
Error: Class 'App\Models\NamaModel' not found
```

### Penyebab

- Autoloader belum di-refresh
- Nama class salah
- Namespace salah
- File belum di-save

### Solusi

1. **Refresh autoloader:**
   ```bash
   composer dump-autoload
   ```

2. **Bersihkan cache:**
   ```bash
   php artisan optimize:clear
   ```

3. **Cek namespace:**
   - Pastikan namespace di file sesuai dengan struktur folder
   - Contoh: `App\Models\User` harus ada di `app/Models/User.php`

4. **Cek import di file lain:**
   ```php
   // Benar
   use App\Models\User;
   use App\Models\Community;

   // Salah
   use User; // tanpa namespace lengkap
   ```

---

## 5. Route Not Found

### Pesan Error

```
404 Not Found
The route ... could not be found.
```

### Penyebab

- Route belum didefinisikan
- Method HTTP salah (GET/POST/PUT/DELETE)
- Middleware memblokir akses
- Nama route salah

### Solusi

1. **Cek semua route:**
   ```bash
   php artisan route:list
   ```

2. **Cek route tertentu:**
   ```bash
   php artisan route:list --name=community
   ```

3. **Cek method yang benar:**
   ```php
   // Di routes/web.php atau routes/api.php
   Route::get('/community', [CommunityController::class, 'index']);
   Route::post('/community', [CommunityController::class, 'store']);
   ```

4. **Pastikan route sudah di-include:**
   ```php
   // Di routes/web.php
   require __DIR__.'/community.php';
   ```

5. **Bersihkan route cache:**
   ```bash
   php artisan route:clear
   php artisan route:cache
   ```

---

## 6. View Not Found

### Pesan Error

```
View [layouts.app] not found.
```

### Penyebab

- File view belum dibuat
- Path view salah
- Nama view salah

### Solusi

1. **Cek struktur view:**
   ```bash
   ls -la resources/views/
   ls -la resources/views/layouts/
   ```

2. **Pastikan nama view benar:**
   ```php
   // Di controller
   return view('community.index'); // resources/views/community/index.blade.php
   return view('layouts.app'); // resources/views/layouts/app.blade.php
   ```

3. **Cek extension file:**
   - Pastikan file `.blade.php` (bukan `.php` biasa)

4. **Bersihkan view cache:**
   ```bash
   php artisan view:clear
   ```

---

## 7. Storage Image Tidak Tampil

### Masalah

Gambar yang di-upload tidak tampil di browser.

### Penyebab

- Storage link belum dibuat
- Permission folder `storage` salah
- File tidak ada di folder yang benar

### Solusi

1. **Buat storage link:**
   ```bash
   php artisan storage:link
   ```
   Ini membuat symlink dari `public/storage` ke `storage/app/public`.

2. **Cek apakah link sudah ada:**
   ```bash
   ls -la public/storage
   ```
   Harusnya menunjuk ke `../storage/app/public`

3. **Set permission (Linux/Mac):**
   ```bash
   sudo chown -R www-data:www-data storage
   sudo chmod -R 755 storage
   ```

4. **Set permission (Windows via XAMPP):**
   - Buka folder `storage`
   - Klik kanan > Properties > Security
   - Edit permission untuk **Everyone**
   - Berikan **Full Control**

5. **Cek konfigurasi filesystem:**
   ```env
   FILESYSTEM_DISK=local
   ```
   Pastikan di `config/filesystems.php`:
   ```php
   'local' => [
       'driver' => 'local',
       'root' => storage_path('app/private'),
       'serve' => true,
       'throw' => false,
   ],

   'public' => [
       'driver' => 'local',
       'root' => storage_path('app/public'),
       'url' => env('APP_URL').'/storage',
       'visibility' => 'public',
       'throw' => false,
   ],
   ```

---

## 8. npm run dev Error

### Pesan Error

```
Error: listen EADDRINUSE: address already in use :::5173
```

atau

```
npm ERR! code ELSPROBLEMS
npm ERR! peer dep ...
```

### Solusi untuk Port Error:

1. **Kill process yang menggunakan port:**
   ```bash
   # Cari process di port 5173
   netstat -ano | findstr :5173

   # Kill process (ganti PID dari hasil di atas)
   taskkill /PID <PID> /F
   ```

2. **Atau gunakan port lain:**
   ```bash
   npx vite --port 5174
   ```

### Solusi untuk Dependency Error:

1. **Hapus node_modules dan install ulang:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Cek versi Node.js:**
   ```bash
   node -v
   ```
   Pastikan versi 18 atau lebih baru.

3. **Clear cache npm:**
   ```bash
   npm cache clean --force
   npm install
   ```

---

## 9. Port 8000 Dipakai

### Pesan Error

```
[Symfony\Component\Process\Exception\ProcessFailedException]
The command "php artisan serve" failed.
Address already in use
```

### Solusi

1. **Gunakan port lain:**
   ```bash
   php artisan serve --port=8080
   ```
   Buka browser: `http://127.0.0.1:8080`

2. **Kill process di port 8000:**
   ```bash
   # Cari process
   netstat -ano | findstr :8000

   # Kill process
   taskkill /PID <PID> /F
   ```

3. **Gunakan XAMPP Apache langsung:**
   - Buka `http://127.0.0.1/komunaid/public`
   - Tidak perlu `php artisan serve`

---

## 10. Apache/MySQL XAMPP Tidak Start

### Masalah

Apache atau MySQL tidak bisa start di XAMPP Control Panel.

### Penyebab Umum

- Port sudah dipakai program lain
- File corrupt
- Windows Firewall memblokir

### Solusi Apache Tidak Start:

1. **Cek port 80:**
   ```bash
   netstat -ano | findstr :80
   ```
   Jika ada process lain, kill atau ganti port Apache:
   - Klik **Config** > **Apache (httpd.conf)**
   - Ubah `Listen 80` menjadi `Listen 8080`

2. **Cek log error:**
   - Klik **Logs** di XAMPP Control Panel
   - Buka file `error.log`

3. **Jalankan sebagai Administrator:**
   - Klik kanan XAMPP > **Run as administrator**

### Solusi MySQL Tidak Start:

1. **Cek port 3306:**
   ```bash
   netstat -ano | findstr :3306
   ```

2. **Kill process MySQL yang tersisa:**
   ```bash
   taskkill /F /IM mysqld.exe
   ```

3. **Restart XAMPP:**
   - Stop semua service
   - Tutup XAMPP
   - Buka ulang sebagai Administrator

4. **Jika data corrupt:**
   - Backup folder `C:\xampp\mysql\data`
   - Jalankan MySQL dari fresh install

---

## 11. File Permission Error

### Pesan Error

```
The stream or file "/var/www/komunaid/storage/logs/laravel.log" could not be opened: failed to open stream: Permission denied
```

### Penyebab

- User web server tidak punya akses ke folder tertentu
- Permission terlalu ketat

### Solusi

**Linux/Mac:**

```bash
# Set ownership ke web server user
sudo chown -R www-data:www-data /var/www/komunaid

# Set permission folder
sudo chmod -R 755 /var/www/komunaid/storage
sudo chmod -R 755 /var/www/komunaid/bootstrap/cache

# Set permission file
sudo find /var/www/komunaid/storage -type f -exec chmod 644 {} \;
sudo find /var/www/komunaid/bootstrap/cache -type f -exec chmod 644 {} \;
```

**Windows (XAMPP):**

1. Klik kanan folder `storage` > **Properties** > **Security**
2. Klik **Edit**
3. Pilih **Users** atau **Everyone**
4. Berikan permission **Full Control**
5. Klik **Apply** > **OK**

---

## 12. Error Lainnya

### 12.1. "No application encryption key has been specified"

```bash
php artisan key:generate
```

### 12.2. "Unable to connect to the database"

Pastikan:
1. MySQL sudah running di XAMPP
2. Database `komunaid_db` sudah dibuat
3. Konfigurasi `.env` sudah benar

```bash
php artisan config:clear
php artisan migrate
```

### 12.3. "Target class does not exist"

```bash
composer dump-autoload
php artisan optimize:clear
```

### 12.4. "csrf token mismatch"

- Clear browser cache
- Clear session:
  ```bash
  php artisan session:clear
  php artisan cache:clear
  ```

### 12.5. "Maximum execution time exceeded"

Edit `php.ini` di XAMPP:
```ini
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
```

Lalu restart Apache.

### 12.6. "Composer not found"

```bash
# Install Composer globally
# Windows: download dari https://getcomposer.org/download/
# Letakkan composer.phar di folder project atau global PATH
```

### 12.7. "Node modules not found"

```bash
npm install
```

### 12.8. "Vite manifest not found"

```bash
npm run build
```
atau jalankan `npm run dev` di terminal terpisah.

---

## Quick Reference - Reset Semua

Jika semua error dan ingin mulai dari awal:

```bash
# 1. Hapus database
php artisan migrate:fresh --seed

# 2. Bersihkan semua cache
php artisan optimize:clear

# 3. Refresh autoloader
composer dump-autoload

# 4. Install ulang node modules
rm -rf node_modules
npm install

# 5. Build assets
npm run build

# 6. Buat storage link
php artisan storage:link

# 7. Generate key (jika belum ada)
php artisan key:generate

# 8. Jalankan
npm run dev   # Terminal 1
php artisan serve  # Terminal 2
```

---

## Mendapatkan Bantuan

Jika masalah belum terselesaikan:

1. **Cek log Laravel:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Jalankan dalam mode debug:**
   ```env
   APP_DEBUG=true
   ```

3. **Cek dokumentasi Laravel:**
   - https://laravel.com/docs
   - https://laravel.com/docs/11.x/deployment

4. **Cek issue di GitHub:**
   - https://github.com/komunaid/komunaid/issues

---

> **Dokumentasi ini terakhir diperbarui:** Juni 2026
