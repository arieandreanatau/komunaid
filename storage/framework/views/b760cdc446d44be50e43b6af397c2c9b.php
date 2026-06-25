<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['size' => 'md', 'dark' => false]));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter((['size' => 'md', 'dark' => false]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>

<?php
    $logoPath = null;
    $paths = [
        'public/images/logo.png',
        'public/images/komunaid-logo.png',
        'public/logo.png',
        'public/logo/komunaid-logo.png',
        'storage/app/public/logo/komunaid-logo.png',
    ];
    foreach ($paths as $p) {
        if (file_exists(public_path($p))) {
            $logoPath = '/' . $p;
            break;
        }
    }

    $sizes = match($size) {
        'sm' => 'h-8',
        'md' => 'h-10',
        'lg' => 'h-12',
        'xl' => 'h-16',
        'hero' => 'h-20',
        default => 'h-10',
    };

    $textSizes = match($size) {
        'sm' => 'text-lg',
        'md' => 'text-xl',
        'lg' => 'text-2xl',
        'xl' => 'text-3xl',
        'hero' => 'text-4xl',
        default => 'text-xl',
    };
?>

<?php if($logoPath): ?>
    <img src="<?php echo e($logoPath); ?>" alt="KomunaID" class="<?php echo e($sizes); ?> w-auto object-contain" loading="lazy">
<?php else: ?>
    <span class="<?php echo e($textSizes); ?> font-extrabold tracking-tight <?php echo e($dark ? 'text-white' : 'text-komuna-navy'); ?>">
        Komuna<span class="<?php echo e($dark ? 'text-komuna-cyan' : 'text-komuna-blue'); ?>">ID</span>
    </span>
<?php endif; ?>
<?php /**PATH C:\xampp\htdocs\komunaid\resources\views/components/logo.blade.php ENDPATH**/ ?>