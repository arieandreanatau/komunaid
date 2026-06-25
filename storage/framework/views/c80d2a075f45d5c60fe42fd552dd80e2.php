<?php $__env->startSection('title', 'Komunitas — KomunaID'); ?>
<?php $__env->startSection('meta_description'); ?>
<meta name="description" content="Jelajahi komunitas-komunitas terbaik di KomunaID. Temukan komunitas yang sesuai dengan minat dan passion Anda.">
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<section class="bg-gradient-to-br from-komuna-navy to-komuna-blue text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-4">Komunitas</h1>
        <p class="text-blue-200 text-lg">Temukan komunitas yang sesuai dengan minatmu.</p>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <form action="<?php echo e(route('communities.directory')); ?>" method="GET" class="mb-8">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" name="search" value="<?php echo e(request('search')); ?>" placeholder="Cari komunitas..." class="flex-1 rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
            <select name="category" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Kategori</option>
                <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($cat->id); ?>" <?php echo e(request('category') == $cat->id ? 'selected' : ''); ?>><?php echo e($cat->name); ?></option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <select name="region" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="">Semua Daerah</option>
                <?php $__currentLoopData = $regions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($r); ?>" <?php echo e(request('region') == $r ? 'selected' : ''); ?>><?php echo e($r); ?></option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <select name="sort" class="rounded-xl border-komuna-border focus:border-komuna-blue focus:ring-komuna-blue text-sm">
                <option value="latest" <?php echo e(request('sort') === 'latest' ? 'selected' : ''); ?>>Terbaru</option>
                <option value="most_members" <?php echo e(request('sort') === 'most_members' ? 'selected' : ''); ?>>Terpopuler</option>
                <option value="recommended" <?php echo e(request('sort') === 'recommended' ? 'selected' : ''); ?>>Rekomendasi</option>
            </select>
            <button type="submit" class="bg-komuna-blue text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-komuna-navy transition">Cari</button>
        </div>
    </form>

    <?php if($communities->isNotEmpty()): ?>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php echo $__env->renderEach('public.partials.community-card', $communities, 'community'); ?>
        </div>
        <div class="mt-8">
            <?php echo e($communities->links()); ?>

        </div>
    <?php else: ?>
        <?php echo $__env->make('public.partials.empty-state', [
            'title' => 'Belum Ada Komunitas',
            'description' => 'Komunitas belum tersedia saat ini. Nantikan terus!',
        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php endif; ?>
</section>

<?php echo $__env->make('public.partials.cta-section', [
    'title' => 'Ingin Membuat Komunitas?',
    'description' => 'Daftar sekarang dan mulai bangun komunitasmu sendiri.',
    'cta_primary' => 'Gabung Sekarang',
    'cta_primary_url' => route('register'),
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.public', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\komunaid\resources\views/public/communities/index.blade.php ENDPATH**/ ?>