<?php $__env->startSection('title', 'KomunaID — Connect, Community, Grow'); ?>
<?php $__env->startSection('meta_description'); ?>
<meta name="description" content="KomunaID menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem kolaborasi.">
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<section class="bg-gradient-to-br from-komuna-navy via-komuna-blue to-komuna-cyan text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="text-center">
            <?php if($sections->has('hero')): ?>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                    <?php echo $sections['hero']->title ?? 'Temukan, Bangun, dan Kembangkan Komunitasmu'; ?>

                </h1>
                <p class="text-xl sm:text-2xl text-blue-200 mb-4 font-light">
                    <?php echo $sections['hero']->subtitle ?? 'KomunaID menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem kolaborasi.'; ?>

                </p>
            <?php else: ?>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                    Temukan, Bangun, dan Kembangkan Komunitasmu
                </h1>
                <p class="text-xl sm:text-2xl text-blue-200 mb-4 font-light">
                    KomunaID menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem kolaborasi.
                </p>
            <?php endif; ?>
            <div class="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <?php if(auth()->guard()->guest()): ?>
                    <a href="<?php echo e(route('register')); ?>" class="bg-komuna-orange text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-orange-500 transition shadow-lg">
                        Gabung Sekarang
                    </a>
                <?php else: ?>
                    <a href="<?php echo e(auth()->user()->getDashboardRoute()); ?>" class="bg-komuna-orange text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-orange-500 transition shadow-lg">
                        Dashboard
                    </a>
                <?php endif; ?>
                <a href="<?php echo e(route('communities.directory')); ?>" class="border-2 border-white text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/10 transition">
                    Jelajahi Komunitas
                </a>
                <a href="<?php echo e(route('about')); ?>" class="border-2 border-white/50 text-white/80 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/5 transition">
                    Buat Komunitas
                </a>
            </div>
        </div>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-text mb-3">Kenapa KomunaID?</h2>
        <p class="text-komuna-muted max-w-xl mx-auto">Platform komunitas Indonesia yang menghubungkan minat, bakat, dan passion Anda.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Connect</h3>
            <p class="text-komuna-muted text-sm">Hubungkan member dengan komunitas yang relevan dengan minat dan passion mereka.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Community</h3>
            <p class="text-komuna-muted text-sm">Kelola komunitas, event, volunteer, dan pengurus dalam satu platform terpadu.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-komuna-border-soft text-center hover:shadow-md transition">
            <div class="w-16 h-16 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-komuna-text mb-2">Grow</h3>
            <p class="text-komuna-muted text-sm">Buka peluang kolaborasi dengan brand dan perusahaan untuk pertumbuhan bersama.</p>
        </div>
    </div>
</section>

<?php if(($recommendedCommunities ?? collect())->isNotEmpty()): ?>
<section class="bg-komuna-light py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
            <h2 class="text-2xl sm:text-3xl font-bold text-komuna-navy mb-3">Rekomendasi Komunitas</h2>
            <p class="text-komuna-muted">Temukan komunitas yang sesuai dengan minatmu.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php echo $__env->renderEach('public.partials.community-card', $recommendedCommunities, 'community'); ?>
        </div>
        <div class="text-center mt-8">
            <a href="<?php echo e(route('communities.directory')); ?>" class="inline-block bg-komuna-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
                Lihat Semua Komunitas
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<?php if(($upcomingEvents ?? collect())->isNotEmpty()): ?>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-text mb-3">Event Terbaru</h2>
        <p class="text-komuna-muted">Jangan lewatkan event menarik dari komunitas-komunitas terbaik.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php echo $__env->renderEach('public.partials.event-card', $upcomingEvents, 'event'); ?>
    </div>
    <div class="text-center mt-8">
        <a href="<?php echo e(route('events.index')); ?>" class="inline-block bg-komuna-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
            Lihat Semua Event
        </a>
    </div>
</section>
<?php endif; ?>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-text mb-3">Cara Kerja KomunaID</h2>
        <p class="text-komuna-muted">Langkah sederhana untuk memulai petualangan komunitasmu.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <?php
            $steps = [
                ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>', 'title' => 'Daftar', 'desc' => 'Buat akun gratis'],
                ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>', 'title' => 'Pilih Minat', 'desc' => 'Tentukan passionmu'],
                ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>', 'title' => 'Temukan', 'desc' => 'Jelajahi komunitas'],
                ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>', 'title' => 'Ikuti Event', 'desc' => 'Gabung event seru'],
                ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>', 'title' => 'Berkembang', 'desc' => 'Bangun kolaborasi'],
            ];
        ?>
        <?php $__currentLoopData = $steps; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $step): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <div class="text-center relative">
                <div class="w-14 h-14 bg-komuna-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><?php echo $step['icon']; ?></svg>
                </div>
                <span class="absolute -top-1 -right-1 w-6 h-6 bg-komuna-orange text-white text-xs font-bold rounded-full flex items-center justify-center"><?php echo e($i + 1); ?></span>
                <h4 class="font-bold text-komuna-text text-sm"><?php echo e($step['title']); ?></h4>
                <p class="text-xs text-komuna-muted mt-1"><?php echo e($step['desc']); ?></p>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>
</section>

<section class="bg-komuna-navy py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="text-white">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4">Untuk Komunitas</h2>
                <p class="text-blue-200 mb-6">Bangun dan kelola komunitasmu dengan mudah. Buat event, kelola member, dan buka peluang kolaborasi.</p>
                <ul class="space-y-2 text-blue-200 text-sm mb-6">
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Buat komunitas gratis</li>
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Kelola member & event</li>
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Buka volunteer & pengurus</li>
                </ul>
                <?php if(auth()->guard()->guest()): ?>
                    <a href="<?php echo e(route('register')); ?>" class="inline-block bg-komuna-orange text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-500 transition">Buat Komunitas</a>
                <?php else: ?>
                    <a href="<?php echo e(auth()->user()->getDashboardRoute()); ?>" class="inline-block bg-komuna-orange text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-500 transition">Dashboard</a>
                <?php endif; ?>
            </div>
            <div class="text-white">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4">Untuk Brand & Perusahaan</h2>
                <p class="text-blue-200 mb-6">Temukan komunitas yang sesuai, ajukan kolaborasi, dan bangun campaign bersama.</p>
                <ul class="space-y-2 text-blue-200 text-sm mb-6">
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Temukan komunitas target</li>
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Ajukan kolaborasi</li>
                    <li class="flex items-center gap-2"><svg class="w-4 h-4 text-komuna-cyan" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Bangun campaign bersama</li>
                </ul>
                <a href="<?php echo e(route('about')); ?>" class="inline-block border-2 border-white text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition">Ajukan Kolaborasi</a>
            </div>
        </div>
    </div>
</section>

<?php if($latestBlogs->isNotEmpty()): ?>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-komuna-text mb-3">Blog Terbaru</h2>
        <p class="text-komuna-muted">Baca artikel dan insight terbaru dari KomunaID.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php echo $__env->renderEach('public.partials.blog-card', $latestBlogs, 'blog'); ?>
    </div>
    <div class="text-center mt-8">
        <a href="<?php echo e(route('blogs.index')); ?>" class="inline-block bg-komuna-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-komuna-navy transition">
            Lihat Semua Blog
        </a>
    </div>
</section>
<?php endif; ?>

<?php echo $__env->make('public.partials.cta-section', [
    'title' => 'Punya Saran untuk KomunaID?',
    'description' => 'Kami terbuka untuk masukan dan saran demi pengembangan platform yang lebih baik.',
    'cta_primary' => 'Kirim Saran',
    'cta_primary_url' => route('contact'),
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.public', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\komunaid\resources\views/public/home.blade.php ENDPATH**/ ?>