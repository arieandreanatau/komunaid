# Rollback Plan

Status: procedure only. Restore evidence is required before release candidate status.

## Preconditions

1. Record release commit, deployment artifact ID, migration list, API health URL, and timestamps.
2. Create database backup with hosting-provider supported tool.
3. Verify artifact integrity and restore backup to isolated MySQL database.
4. Run schema inspection and read-only smoke queries on restored database.
5. Start API against restored isolated database and run health, login, refresh, community media, organization event, and admin authorization smoke tests.
6. Preserve prior web/API deployment artifact for platform rollback.

## Migration Failure

1. Stop deployment progression.
2. Do not attempt ad-hoc DDL on production.
3. Roll web/API artifact back to prior known-good release.
4. If migration altered data or schema incompatibly, restore verified backup using provider procedure.
5. Confirm restored schema, health endpoint, read-only public pages, authentication, and logs.
6. Record incident, exact commands run, artifact IDs, restore evidence, and remaining data loss window.

## Acceptance Evidence

- Backup artifact identifier and checksum/provider completion record.
- Restore target isolated from production.
- Restore completion record.
- Schema and smoke-test logs from restored DB.
- Deployment rollback artifact ID and successful post-rollback health response.

Without all evidence, backup, restore, and rollback remain `BLOCKED`.
