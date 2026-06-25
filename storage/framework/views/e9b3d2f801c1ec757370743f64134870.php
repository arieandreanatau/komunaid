<nav class="bg-white shadow-sm border-b border-komuna-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="<?php echo e(route('home')); ?>">
                    <?php if (isset($component)) { $__componentOriginal987d96ec78ed1cf75b349e2e5981978f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal987d96ec78ed1cf75b349e2e5981978f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.logo','data' => ['size' => 'md']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('logo'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['size' => 'md']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal987d96ec78ed1cf75b349e2e5981978f)): ?>
<?php $attributes = $__attributesOriginal987d96ec78ed1cf75b349e2e5981978f; ?>
<?php unset($__attributesOriginal987d96ec78ed1cf75b349e2e5981978f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal987d96ec78ed1cf75b349e2e5981978f)): ?>
<?php $component = $__componentOriginal987d96ec78ed1cf75b349e2e5981978f; ?>
<?php unset($__componentOriginal987d96ec78ed1cf75b349e2e5981978f); ?>
<?php endif; ?>
                </a>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-1">
                    <a href="<?php echo e(route('home')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('home') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Beranda</a>
                    <a href="<?php echo e(route('communities.directory')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('communities.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Komunitas</a>
                    <a href="<?php echo e(route('events.index')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('events.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Events</a>
                    <a href="<?php echo e(route('blogs.index')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('blogs.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Blog</a>
                    <a href="<?php echo e(route('about')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('about') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Tentang Kami</a>
                    <a href="<?php echo e(route('contact')); ?>" class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg <?php echo e(request()->routeIs('contact') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:text-komuna-blue hover:bg-komuna-light/50'); ?>">Hubungi Kami</a>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <?php if(auth()->guard()->check()): ?>
                    <div class="hidden sm:flex items-center space-x-3">
                        <?php if(auth()->user()->hasRole('superadmin')): ?>
                            <a href="<?php echo e(route('superadmin.dashboard')); ?>" class="text-sm font-medium text-komuna-navy hover:text-komuna-blue">Admin Panel</a>
                        <?php endif; ?>
                        <a href="<?php echo e(auth()->user()->getDashboardRoute()); ?>" class="text-sm text-komuna-muted hover:text-komuna-blue">Dashboard</a>
                        <div class="w-8 h-8 bg-komuna-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                            <?php echo e(substr(auth()->user()->name, 0, 1)); ?>

                        </div>
                        <form method="POST" action="<?php echo e(route('logout')); ?>">
                            <?php echo csrf_field(); ?>
                            <button type="submit" class="text-sm text-komuna-muted hover:text-komuna-danger">Logout</button>
                        </form>
                    </div>
                <?php else: ?>
                    <a href="<?php echo e(route('login')); ?>" class="text-sm font-medium text-komuna-text hover:text-komuna-blue">Login</a>
                    <a href="<?php echo e(route('register')); ?>" class="bg-komuna-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-komuna-navy transition">Gabung Sekarang</a>
                <?php endif; ?>
                <button id="mobile-menu-btn" class="sm:hidden text-komuna-muted hover:text-komuna-blue" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden sm:hidden border-t border-komuna-border bg-white">
        <div class="px-4 py-3 space-y-1">
            <a href="<?php echo e(route('home')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('home') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Beranda</a>
            <a href="<?php echo e(route('communities.directory')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('communities.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Komunitas</a>
            <a href="<?php echo e(route('events.index')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('events.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Events</a>
            <a href="<?php echo e(route('blogs.index')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('blogs.*') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Blog</a>
            <a href="<?php echo e(route('about')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('about') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Tentang Kami</a>
            <a href="<?php echo e(route('contact')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium <?php echo e(request()->routeIs('contact') ? 'text-komuna-blue bg-komuna-light' : 'text-komuna-text hover:bg-komuna-light/50'); ?>">Hubungi Kami</a>
            <?php if(auth()->guard()->guest()): ?>
                <div class="border-t border-komuna-border pt-3 mt-3 space-y-2">
                    <a href="<?php echo e(route('login')); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium text-komuna-text hover:bg-komuna-light/50">Login</a>
                    <a href="<?php echo e(route('register')); ?>" class="block px-3 py-2 rounded-lg text-sm font-semibold text-white bg-komuna-blue hover:bg-komuna-navy text-center">Gabung Sekarang</a>
                </div>
            <?php else: ?>
                <div class="border-t border-komuna-border pt-3 mt-3">
                    <a href="<?php echo e(auth()->user()->getDashboardRoute()); ?>" class="block px-3 py-2 rounded-lg text-sm font-medium text-komuna-blue hover:bg-komuna-light">Dashboard</a>
                    <form method="POST" action="<?php echo e(route('logout')); ?>">
                        <?php echo csrf_field(); ?>
                        <button type="submit" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-komuna-danger hover:bg-komuna-danger-soft">Logout</button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
    </div>
</nav>
<?php /**PATH C:\xampp\htdocs\komunaid\resources\views/public/partials/navbar.blade.php ENDPATH**/ ?>