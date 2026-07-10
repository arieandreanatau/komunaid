import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    { name: "Teknologi", slug: "teknologi", description: "Komunitas teknologi dan pengembangan software" },
    { name: "Bisnis", slug: "bisnis", description: "Komunitas bisnis dan startup" },
    { name: "Desain", slug: "desain", description: "Komunitas desain grafis dan UI/UX" },
    { name: "Pendidikan", slug: "pendidikan", description: "Komunitas pendidikan dan belajar" },
    { name: "Olahraga", slug: "olahraga", description: "Komunitas olahraga dan fitness" },
    { name: "Seni & Budaya", slug: "seni-budaya", description: "Komunitas seni dan budaya" },
    { name: "Lingkungan", slug: "lingkungan", description: "Komunitas peduli lingkungan" },
    { name: "Kesehatan", slug: "kesehatan", description: "Komunitas kesehatan dan wellness" },
    { name: "Musik", slug: "musik", description: "Komunitas musik dan audio" },
    { name: "Fotografi", slug: "fotografi", description: "Komunitas fotografi dan videografi" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Categories seeded");

  // ==========================================
  // SUPER ADMIN
  // ==========================================

  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@komuna.id" },
    update: {},
    create: {
      name: "Super Admin",
      username: "superadmin",
      email: "admin@komuna.id",
      password: superAdminPassword,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      roles: {
        create: {
          role: "SUPER_ADMIN",
        },
      },
    },
  });

  console.log("Super Admin seeded:", superAdmin.email);

  // ==========================================
  // PLATFORM ADMIN
  // ==========================================

  const platformAdminPassword = await bcrypt.hash("PlatformAdmin123!", 12);

  const platformAdmin = await prisma.user.upsert({
    where: { email: "platform@komuna.id" },
    update: {},
    create: {
      name: "Platform Admin",
      username: "platformadmin",
      email: "platform@komuna.id",
      password: platformAdminPassword,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      roles: {
        create: {
          role: "PLATFORM_ADMIN",
        },
      },
    },
  });

  console.log("Platform Admin seeded:", platformAdmin.email);

  // ==========================================
  // DEMO MEMBER
  // ==========================================

  const memberPassword = await bcrypt.hash("Member123!", 12);

  const member = await prisma.user.upsert({
    where: { email: "member@komuna.id" },
    update: {},
    create: {
      name: "Demo Member",
      username: "demomember",
      email: "member@komuna.id",
      password: memberPassword,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      bio: "Anggota demo KomunaID",
      location: "Jakarta",
      roles: {
        create: {
          role: "MEMBER",
        },
      },
      interests: {
        createMany: {
          data: [
            { interest: "Teknologi" },
            { interest: "Bisnis" },
            { interest: "Desain" },
          ],
        },
      },
    },
  });

  console.log("Demo Member seeded:", member.email);

  // ==========================================
  // DEMO COMMUNITY (Approved)
  // ==========================================

  const techCommunity = await prisma.community.upsert({
    where: { slug: "komunitas-teknologi-jakarta" },
    update: {},
    create: {
      name: "Komunitas Teknologi Jakarta",
      slug: "komunitas-teknologi-jakarta",
      description: "Komunitas untuk para pengembang teknologi di Jakarta. Diskusi, sharing, dan belajar bersama.",
      location: "Jakarta",
      membershipType: "OPEN",
      status: "APPROVED",
      ownerId: member.id,
      members: {
        create: {
          userId: member.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
      categories: {
        create: {
          category: { connect: { slug: "teknologi" } },
        },
      },
    },
  });

  console.log("Demo Community seeded:", techCommunity.name);

  // ==========================================
  // DEMO PENDING COMMUNITY
  // ==========================================

  const pendingCommunity = await prisma.community.upsert({
    where: { slug: "komunitas-desain-bandung" },
    update: {},
    create: {
      name: "Komunitas Desain Bandung",
      slug: "komunitas-desain-bandung",
      description: "Komunitas desainer grafis dan UI/UX di Bandung.",
      location: "Bandung",
      membershipType: "RESTRICTED",
      status: "PENDING",
      ownerId: member.id,
      members: {
        create: {
          userId: member.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
      categories: {
        create: {
          category: { connect: { slug: "desain" } },
        },
      },
    },
  });

  console.log("Pending Community seeded:", pendingCommunity.name);

  // ==========================================
  // DEMO EVENT
  // ==========================================

  const event = await prisma.event.upsert({
    where: { slug: "meetup-teknologi-juli-2026" },
    update: {},
    create: {
      title: "Meetup Teknologi Juli 2026",
      slug: "meetup-teknologi-juli-2026",
      description: "Meetup bulanan komunitas teknologi Jakarta. Topik: AI dan Machine Learning.",
      location: "Jakarta",
      isOnline: false,
      eventDate: new Date("2026-07-25T19:00:00+07:00"),
      endDate: new Date("2026-07-25T22:00:00+07:00"),
      quota: 50,
      status: "PUBLISHED",
      communityId: techCommunity.id,
      createdById: member.id,
      registrations: {
        create: {
          userId: member.id,
          status: "CONFIRMED",
        },
      },
      categories: {
        create: {
          category: { connect: { slug: "teknologi" } },
        },
      },
    },
  });

  console.log("Demo Event seeded:", event.title);

  // ==========================================
  // DEMO ORGANIZATION
  // ==========================================

  const org = await prisma.organization.upsert({
    where: { slug: "pt-teknologi-nusantara" },
    update: {},
    create: {
      name: "PT Teknologi Nusantara",
      slug: "pt-teknologi-nusantara",
      description: "Perusahaan teknologi yang berfokus pada solusi digital untuk UMKM.",
      location: "Jakarta",
      industry: "Teknologi",
      status: "APPROVED",
      ownerId: member.id,
      members: {
        create: {
          userId: member.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
  });

  console.log("Demo Organization seeded:", org.name);

  // ==========================================
  // SETTINGS
  // ==========================================

  await prisma.setting.upsert({
    where: { key: "platform_name" },
    update: {},
    create: {
      key: "platform_name",
      value: "KomunaID",
    },
  });

  await prisma.setting.upsert({
    where: { key: "platform_tagline" },
    update: {},
    create: {
      key: "platform_tagline",
      value: "Platform - People - Community - Partnership",
    },
  });

  await prisma.setting.upsert({
    where: { key: "registration_enabled" },
    update: {},
    create: {
      key: "registration_enabled",
      value: true,
    },
  });

  await prisma.setting.upsert({
    where: { key: "maintenance_mode" },
    update: {},
    create: {
      key: "maintenance_mode",
      value: false,
    },
  });

  console.log("Settings seeded");

  console.log("\nSeeding completed!");
  console.log("\nAccounts (see .env.example for default passwords):");
  console.log("  Super Admin:    admin@komuna.id");
  console.log("  Platform Admin: platform@komuna.id");
  console.log("  Demo Member:    member@komuna.id");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
