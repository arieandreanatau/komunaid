const fs = require("fs");
const path = require("path");

const pnpmDir = path.join("node_modules", ".pnpm");
const prismaClientDir = fs.readdirSync(pnpmDir).find((d) =>
  d.startsWith("@prisma+client")
);

if (!prismaClientDir) {
  console.error("Prisma client not found in pnpm store");
  process.exit(1);
}

const engineSrc = path.join(pnpmDir, prismaClientDir, "node_modules", ".prisma", "client");

if (!fs.existsSync(engineSrc)) {
  console.error("Prisma engine source not found:", engineSrc);
  process.exit(1);
}

const targets = [
  path.join("apps", "web", ".next", "server", ".prisma", "client"),
  path.join("apps", "web", ".next", "server", "prisma"),
];

targets.forEach((dst) => {
  fs.mkdirSync(dst, { recursive: true });
  const files = fs.readdirSync(engineSrc).filter((f) => f.endsWith(".node") || f.endsWith(".so.node"));
  files.forEach((f) => {
    console.log(`Copying ${f} -> ${dst}`);
    fs.copyFileSync(path.join(engineSrc, f), path.join(dst, f));
  });
});

const engineFiles = fs.readdirSync(engineSrc).filter((f) => f.endsWith(".node") || f.endsWith(".so.node"));
console.log("Copied", engineFiles.length, "engine binary(ies)");
