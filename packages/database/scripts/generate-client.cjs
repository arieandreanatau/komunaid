const { spawnSync } = require("child_process");
const path = require("path");

const packageRoot = path.resolve(__dirname, "..");
const prismaCli = path.join(packageRoot, "node_modules", "prisma", "build", "index.js");
const schema = path.join(packageRoot, "prisma", "schema.prisma");
const env = { ...process.env };

// This project uses Prisma's local library engine with a direct MySQL URL.
delete env.PRISMA_GENERATE_NO_ENGINE;
delete env.PRISMA_GENERATE_DATAPROXY;
delete env.PRISMA_GENERATE_ACCELERATE;

const result = spawnSync(process.execPath, [prismaCli, "generate", "--schema", schema], {
  cwd: packageRoot,
  env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
