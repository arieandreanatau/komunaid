<?php $__env->startSection('title', $page->meta_title ?? ($page->title ?? 'Tentang Kami') . ' — KomunaID'); ?>
<?php $__env->startSection('meta_description'); ?>
<meta name="description" content="<?php echo e($page->meta_description ?? 'Kenali lebih dekat KomunaID, platform komunitas Indonesia yang menghubungkan member, komunitas, brand, dan perusahaan.'); ?>">
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<section class="bg-komuna-gradient-hero text-white py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4"><?php echo e($page->title ?? 'Tentang KomunaID'); ?></h1>
        <p class="text-blue-200 text-lg">Kenali lebih dekat platform yang menghubungkan komunitas Indonesia.</p>
    </div>
</section>

<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="prose prose-lg max-w-none prose-headings:text-komuna-navy prose-a:text-komuna-blue">
        <?php echo $page->content; ?>

    </div>
</section>

<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="text-center">
            <div class="w-14 h-14 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 class="font-bold text-komuna-text">Connect</h3>
            <p class="text-sm text-komuna-muted mt-1">Hubungkan minat dan passion</p>
        </div>
        <div class="text-center">
            <div class="w-14 h-14 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 class="font-bold text-komuna-text">Community</h3>
            <p class="text-sm text-komuna-muted mt-1">Bangun komunitas kuat</p>
        </div>
        <div class="text-center">
            <div class="w-14 h-14 bg-komuna-light rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-komuna-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <h3 class="font-bold text-komuna-text">Grow</h3>
            <p class="text-sm text-komuna-muted mt-1">Tumbuh bersama</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-komuna-light rounded-2xl p-6">
            <h3 class="font-bold text-komuna-navy text-lg mb-2">Untuk Member</h3>
            <p class="text-sm text-komuna-muted">Temukan komunitas yang sesuai minatmu, ikuti event, dan bangun relasi bermakna.</p>
        </div>
        <div class="bg-komuna-light rounded-2xl p-6">
            <h3 class="font-bold text-komuna-navy text-lg mb-2">Untuk Komunitas</h3>
            <p class="text-sm text-komuna-muted">Kelola komunitas, event, volunteer, dan pengurus dalam satu platform.</p>
        </div>
        <div class="bg-komuna-light rounded-2xl p-6">
            <h3 class="font-bold text-komuna-navy text-lg mb-2">Untuk Brand</h3>
            <p class="text-sm text-komuna-muted">Temukan komunitas target dan ajukan kolaborasi strategis.</p>
        </div>
        <div class="bg-komuna-light rounded-2xl p-6">
            <h3 class="font-bold text-komuna-navy text-lg mb-2">Untuk Perusahaan</h3>
            <p class="text-sm text-komuna-muted">Bangun campaign bersama komunitas dan perluas jangkauan.</p>
        </div>
    </div>
</section>

<?php echo $__env->make('public.partials.cta-section', [
    'title' => 'Siap Bergabung?',
    'description' => 'Mulai jelajahi komunitas sekarang dan temukan tempat yang tepat untuk Anda.',
    'cta_primary' => 'Gabung Sekarang',
    'cta_primary_url' => route('register'),
    'cta_secondary' => 'Jelajahi Komunitas',
    'cta_secondary_url' => route('communities.directory'),
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.public', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\komunaid\resources\views/public/about.blade.php ENDPATH**/ ?>