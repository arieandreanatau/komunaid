<?php $__env->startSection('content'); ?>
<section class="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                Komuna<span class="text-emerald-300">ID</span>
            </h1>
            <p class="text-xl sm:text-2xl text-emerald-100 mb-4 font-light">Connect. Collaborate. Community.</p>
            <p class="text-base sm:text-lg text-emerald-200 mb-10 max-w-2xl mx-auto">
                Temukan komunitas yang sesuai minatmu, terhubung dengan orang-orang sejiwa, dan bangun kolaborasi yang bermakna.
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <a href="<?php echo e(route('communities.directory')); ?>" class="bg-white text-emerald-700 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-emerald-50 transition shadow-lg">
                    Jelajahi Komunitas
                </a>
                <?php if(auth()->guard()->guest()): ?>
                    <a href="<?php echo e(route('register')); ?>" class="border-2 border-white text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/10 transition">
                        Daftar Sekarang
                    </a>
                <?php else: ?>
                    <a href="<?php echo e(route('member.dashboard')); ?>" class="border-2 border-white text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/10 transition">
                        Dashboard
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Kenapa KomunaID?</h2>
        <p class="text-gray-600 max-w-xl mx-auto">Platform komunitas Indonesia yang menghubungkan minat, bakat, dan passion Anda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div class="text-4xl mb-4">🔍</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Temukan Komunitas</h3>
            <p class="text-gray-600 text-sm">Jelajahi ratusan komunitas berdasarkan minat, kategori, dan lokasi Anda.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div class="text-4xl mb-4">🤝</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Bergabung & Terhubung</h3>
            <p class="text-gray-600 text-sm">Join komunitas, ikuti event, dan jalin relasi dengan anggota lainnya.</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div class="text-4xl mb-4">🚀</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Berkembang Bersama</h3>
            <p class="text-gray-600 text-sm">Belajar, berkolaborasi, dan tumbuh bersama komunitas yang suportif.</p>
        </div>
    </div>
</section>

<section class="bg-gray-100 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Siap Bergabung?</h2>
        <p class="text-gray-600 mb-8 max-w-lg mx-auto">Mulai jelajahi komunitas sekarang dan temukan tempat yang tepat untuk Anda.</p>
        <a href="<?php echo e(route('communities.directory')); ?>" class="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition shadow">
            Lihat Semua Komunitas
        </a>
    </div>
</section>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\komunaid\resources\views/guest/home.blade.php ENDPATH**/ ?>