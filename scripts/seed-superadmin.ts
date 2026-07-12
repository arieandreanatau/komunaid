import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@komunaid.com";
  const username = "superadmin";
  const password = "Admin123!";
  const name = "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists (id: ${existing.id})`);
    const existingRoles = await prisma.userRole.findMany({ where: { userId: existing.id } });
    console.log(`Roles: ${existingRoles.map(r => r.role).join(", ")}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      roles: {
        create: { role: "SUPER_ADMIN" },
      },
    },
  });

  console.log("Super Admin created:");
  console.log(`  ID:    ${user.id}`);
  console.log(`  Email: ${email}`);
  console.log(`  User:  ${username}`);
  console.log(`  Pass:  ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
