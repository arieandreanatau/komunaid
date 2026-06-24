<nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="<?php echo e(route('home')); ?>" class="text-xl font-bold text-emerald-600">KomunaID</a>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="<?php echo e(route('home')); ?>" class="inline-flex items-center px-1 pt-1 text-sm font-medium <?php echo e(request()->routeIs('home') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600'); ?>">Home</a>
                    <a href="<?php echo e(route('communities.directory')); ?>" class="inline-flex items-center px-1 pt-1 text-sm font-medium <?php echo e(request()->routeIs('communities.*') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600'); ?>">Komunitas</a>
                    <a href="<?php echo e(route('events.index')); ?>" class="inline-flex items-center px-1 pt-1 text-sm font-medium <?php echo e(request()->routeIs('events.*') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-900 hover:text-emerald-600'); ?>">Events</a>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <?php if(auth()->guard()->check()): ?>
                    <div class="flex items-center space-x-3">
                        <?php if(auth()->user()->hasRole('superadmin')): ?>
                            <a href="<?php echo e(route('superadmin.dashboard')); ?>" class="text-sm font-medium text-red-600 hover:text-red-800">Superadmin</a>
                        <?php endif; ?>
                        <?php if(auth()->user()->hasRole('community_owner')): ?>
                            <a href="<?php echo e(route('community.dashboard')); ?>" class="text-sm text-gray-700 hover:text-emerald-600">Owner Panel</a>
                        <?php endif; ?>
                        <?php if(auth()->user()->hasRole('brand_owner')): ?>
                            <a href="<?php echo e(route('brand.dashboard')); ?>" class="text-sm text-gray-700 hover:text-emerald-600">Brand Panel</a>
                        <?php endif; ?>
                        <a href="<?php echo e(auth()->user()->getDashboardRoute()); ?>" class="text-sm text-gray-700 hover:text-emerald-600">Dashboard</a>
                        <span class="text-sm text-gray-500"><?php echo e(auth()->user()->name); ?></span>
                        <form method="POST" action="<?php echo e(route('logout')); ?>">
                            <?php echo csrf_field(); ?>
                            <button type="submit" class="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </form>
                    </div>
                <?php else: ?>
                    <a href="<?php echo e(route('login')); ?>" class="text-sm text-gray-700 hover:text-emerald-600">Login</a>
                    <a href="<?php echo e(route('register')); ?>" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Register</a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</nav>
<?php /**PATH C:\xampp\htdocs\komunaid\resources\views/partials/navbar.blade.php ENDPATH**/ ?>