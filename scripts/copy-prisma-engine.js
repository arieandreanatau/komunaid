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

const engineExtensions = [".node", ".so.node", ".so"];

targets.forEach((dst) => {
  fs.mkdirSync(dst, { recursive: true });
  const files = fs.readdirSync(engineSrc).filter((f) =>
    engineExtensions.some((ext) => f.endsWith(ext)) || f.includes("query_engine")
  );
  files.forEach((f) => {
    const src = path.join(engineSrc, f);
    const dest = path.join(dst, f);
    console.log(`Copying ${f} -> ${dest}`);
    fs.copyFileSync(src, dest);
  });
});

// Also copy schema.prisma if it exists
const schemaSrc = path.join(engineSrc, "schema.prisma");
if (fs.existsSync(schemaSrc)) {
  targets.forEach((dst) => {
    fs.copyFileSync(schemaSrc, path.join(dst, "schema.prisma"));
  });
  console.log("Copied schema.prisma");
}

const allFiles = fs.readdirSync(engineSrc);
const engineFiles = allFiles.filter((f) =>
  engineExtensions.some((ext) => f.endsWith(ext)) || f.includes("query_engine")
);
console.log("Engine files in source:", allFiles.length);
console.log("Engine binaries copied:", engineFiles.length);
