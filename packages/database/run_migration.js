/**
 * @deprecated This migration is redundant with the Prisma migration.
 * The tokenVersion column and index are already created by the initial migration.
 * This file is kept for reference only. Do NOT run against MySQL 8.0
 * (uses MariaDB-only IF NOT EXISTS syntax).
 *
 * If you need to add tokenVersion manually, use:
 *   ALTER TABLE users ADD COLUMN tokenVersion INT NOT NULL DEFAULT 0;
 *   CREATE INDEX users_tokenVersion_idx ON users(tokenVersion);
 *
 * Or better: run `pnpm db:migrate` to apply Prisma migrations.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if column already exists
    const [columns] = await prisma.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'tokenVersion'
    `;

    if (columns && columns.length > 0) {
      console.log('✅ Column tokenVersion already exists — skipping');
    } else {
      await prisma.$queryRaw`ALTER TABLE users ADD COLUMN tokenVersion INT NOT NULL DEFAULT 0`;
      console.log('✅ Column tokenVersion added to users table');
    }

    // Check if index already exists
    const [indexes] = await prisma.$queryRaw`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'users_tokenVersion_idx'
    `;

    if (indexes && indexes.length > 0) {
      console.log('✅ Index users_tokenVersion_idx already exists — skipping');
    } else {
      await prisma.$queryRaw`CREATE INDEX users_tokenVersion_idx ON users(tokenVersion)`;
      console.log('✅ Index users_tokenVersion_idx created');
    }

    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
