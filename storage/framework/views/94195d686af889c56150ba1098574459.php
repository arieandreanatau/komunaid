<div class="text-center py-12 px-6">
    <?php if(isset($icon)): ?>
        <div class="w-16 h-16 bg-komuna-border-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <?php echo $icon; ?>

        </div>
    <?php else: ?>
        <div class="w-16 h-16 bg-komuna-border-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-komuna-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        </div>
    <?php endif; ?>
    <h3 class="text-lg font-semibold text-komuna-text mb-1"><?php echo e($title ?? 'Belum Ada Data'); ?></h3>
    <p class="text-sm text-komuna-light-text max-w-sm mx-auto"><?php echo e($description ?? 'Data belum tersedia saat ini.'); ?></p>
    <?php if(isset($action)): ?>
        <div class="mt-4"><?php echo $action; ?></div>
    <?php endif; ?>
</div>
<?php /**PATH C:\xampp\htdocs\komunaid\resources\views/public/partials/empty-state.blade.php ENDPATH**/ ?>