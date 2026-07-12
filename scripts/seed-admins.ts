import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type PlatformRole = "SUPER_ADMIN" | "PLATFORM_ADMIN";

interface AdminSeed {
  email: string;
  username: string;
  password: string;
  name: string;
  phone?: string;
  bio?: string;
  role: PlatformRole;
}

const admins: AdminSeed[] = [
  {
    email: "admin@komunaid.com",
    username: "superadmin",
    password: "Admin123!",
    name: "Super Admin",
    phone: "+628120000001",
    bio: "Platform administrator utama KomunaID",
    role: "SUPER_ADMIN",
  },
  {
    email: "siti.nurhaliza@komunaid.com",
    username: "siti_admin",
    password: "Admin123!",
    name: "Siti Nurhaliza",
    phone: "+628120000002",
    bio: "Super Admin - Governance & Policy",
    role: "SUPER_ADMIN",
  },
  {
    email: "budi.santoso@komunaid.com",
    username: "budi_admin",
    password: "Admin123!",
    name: "Budi Santoso",
    phone: "+628120000003",
    bio: "Platform Admin - Community Moderation",
    role: "PLATFORM_ADMIN",
  },
  {
    email: "dewi.lestari@komunaid.com",
    username: "dewi_admin",
    password: "Admin123!",
    name: "Dewi Lestari",
    phone: "+628120000004",
    bio: "Platform Admin - Event & Volunteer Management",
    role: "PLATFORM_ADMIN",
  },
  {
    email: "andi.prasetyo@komunaid.com",
    username: "andi_admin",
    password: "Admin123!",
    name: "Andi Prasetyo",
    phone: "+628120000005",
    bio: "Platform Admin - Member Support & CMS",
    role: "PLATFORM_ADMIN",
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  let created = 0;
  let skipped = 0;

  console.log("=========================================");
  console.log("  KomunaID Admin Seed");
  console.log("=========================================\n");

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (existing) {
      const roles = await prisma.userRole.findMany({ where: { userId: existing.id } });
      console.log(`[SKIP]  ${admin.email} already exists (role: ${roles.map(r => r.role).join(", ")})`);
      skipped++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: admin.email,
        username: admin.username,
        password: hashedPassword,
        name: admin.name,
        phone: admin.phone || null,
        bio: admin.bio || null,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        roles: {
          create: { role: admin.role },
        },
      },
    });

    created++;
    console.log(`[CREATED] ${admin.name}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Password: ${admin.password}`);
    console.log(`  Role:     ${admin.role}`);
    console.log(`  ID:       ${user.id}\n`);
  }

  console.log("=========================================");
  console.log(`  Done: ${created} created, ${skipped} skipped`);
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
