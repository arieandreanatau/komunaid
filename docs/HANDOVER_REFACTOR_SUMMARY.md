

## Final State (Tahap 5 + Windows File Lock)

- HEAD: c41b08c
- Tests: 185/188 (3 pre-existing AdminChat failures unrelated to refactor - DB schema missing 'subject' column in admin_conversations)
- Routes: 428 (unchanged)
- Migrations: 99 Ran (no schema change)
- npm build: green
- composer.json: includes 'files' autoload entry pointing to FactoryShimBootstrap.php

### Known File Lock Issue

3 factory files at database/factories/ are locked at OS level (0 bytes on disk, can not be unlinked/renamed/written):
- UserFactory.php
- ProfileFactory.php
- AdminConversationFactory.php

Workaround: app/Shims/FactoryShimBootstrap.php (loaded via composer autoload.files) aliases canonical class names to App\\Shims\\* classes.

### Recovery Steps

When file locks are released (system restart, chkdsk, or container rebuild):
1. Delete app/Shims/ directory
2. Remove 'files' autoload entry from composer.json
3. The original factory files at database/factories/ will resume control (need to restore from ba89849)
4. Run composer dump-autoload + php artisan test (expect 188 pass)

### Next Steps for Tahap 5 Resumption

1. Restart XAMPP or system to release file locks
2. Use scripted approach (scripts/migrate_models_v2.php) to group 69 models into 14 sub-folders
3. Run with safety net (backup tag pre-tahap-5-v2)
4. Staged commits: copy -> namespace -> references -> delete


## Final State (Tahap 5 + Windows File Lock)

- HEAD: c41b08c
- Tests: 185/188 (3 pre-existing AdminChat failures unrelated to refactor - DB schema missing 'subject' column in admin_conversations)
- Routes: 428 (unchanged)
- Migrations: 99 Ran (no schema change)
- npm build: green
- composer.json: includes 'files' autoload entry pointing to FactoryShimBootstrap.php

### Known File Lock Issue

3 factory files at database/factories/ are locked at OS level (0 bytes on disk):
- UserFactory.php
- ProfileFactory.php
- AdminConversationFactory.php

Workaround: app/Shims/FactoryShimBootstrap.php (loaded via composer autoload.files) aliases canonical class names to App\\Shims\\* classes.

### Recovery Steps

When file locks are released (system restart, chkdsk, or container rebuild):
1. Delete app/Shims/ directory
2. Remove 'files' autoload entry from composer.json
3. Restore original factory files from ba89849
4. Run composer dump-autoload + php artisan test (expect 188 pass)

### Next Steps for Tahap 5 Resumption

1. Restart XAMPP or system to release file locks
2. Use scripted approach to group 69 models into 14 sub-folders
3. Run with safety net (backup tag pre-tahap-5-v2)
4. Staged commits: copy -> namespace -> references -> delete
