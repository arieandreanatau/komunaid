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

  // ==========================================
  // MASTER DATA WILAYAH (Indonesia)
  // ==========================================
  // Structure:
  //   master_countries  : string[]
  //   master_provinces  : { country: string[] }
  //   master_cities     : { province: string[] }
  //   master_districts  : { city: string[] }
  //   master_kelurahan  : { district: string[] }

  const masterCountries = ["Indonesia"];

  const masterProvinces: Record<string, string[]> = {
    Indonesia: [
      "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi",
      "Bengkulu", "Sumatera Selatan", "Bangka Belitung", "Lampung",
      "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
      "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
      "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
      "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
      "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Tengah", "Papua Pegunungan", "Papua Selatan",
    ],
  };

  const masterCities: Record<string, string[]> = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
    "Jawa Barat": ["Kota Bandung", "Kota Bogor", "Kota Bekasi", "Kota Depok", "Kota Cimahi", "Kota Tasikmalaya", "Kabupaten Bandung", "Kabupaten Bogor"],
    "Banten": ["Kota Tangerang", "Kota Tangerang Selatan", "Kota Serang", "Kota Cilegon", "Kabupaten Tangerang"],
    "Jawa Tengah": ["Kota Semarang", "Kota Surakarta", "Kota Magelang", "Kabupaten Semarang", "Kabupaten Banyumas"],
    "DI Yogyakarta": ["Kota Yogyakarta", "Kabupaten Sleman", "Kabupaten Bantul", "Kabupaten Kulon Progo", "Kabupaten Gunung Kidul"],
    "Jawa Timur": ["Kota Surabaya", "Kota Malang", "Kota Kediri", "Kabupaten Malang", "Kabupaten Sidoarjo"],
    "Bali": ["Kota Denpasar", "Kabupaten Badung", "Kabupaten Gianyar", "Kabupaten Buleleng"],
    "Sumatera Utara": ["Kota Medan", "Kota Binjai", "Kabupaten Deli Serdang", "Kabupaten Karo"],
    "Sumatera Selatan": ["Kota Palembang", "Kota Prabumulih", "Kabupaten Banyuasin"],
    "Kalimantan Timur": ["Kota Samarinda", "Kota Balikpapan", "Kabupaten Kutai Kartanegara"],
    "Sulawesi Selatan": ["Kota Makassar", "Kota Parepare", "Kabupaten Gowa"],
    "Lampung": ["Kota Bandar Lampung", "Kota Metro", "Kabupaten Lampung Selatan"],
    "Riau": ["Kota Pekanbaru", "Kota Dumai", "Kabupaten Siak"],
    "Papua": ["Kota Jayapura", "Kabupaten Jayapura"],
  };

  const masterDistricts: Record<string, string[]> = {
    "Jakarta Pusat": ["Gambir", "Tanah Abang", "Senen", "Cempaka Putih", "Menteng"],
    "Jakarta Selatan": ["Kebayoran Baru", "Setiabudi", "Tebet", "Pancoran", "Mampang Prapatan"],
    "Kota Bandung": ["Coblong", "Bandung Wetan", "Cibeunying Kaler", "Sukajadi", "Sumur Bandung"],
    "Kota Bekasi": ["Bekasi Timur", "Bekasi Barat", "Bekasi Selatan", "Bekasi Utara", "Medan Satria"],
    "Kota Depok": ["Beji", "Pancoran Mas", "Cimanggis", "Sukmajaya", "Sawangan"],
    "Kota Tangerang": ["Ciledug", "Cipondoh", "Jatiuwung", "Karawaci", "Benda"],
    "Kota Tangerang Selatan": ["Ciputat", "Ciputat Timur", "Pamulang", "Serpong", "Setu"],
    "Kota Semarang": ["Semarang Tengah", "Semarang Utara", "Semarang Selatan", "Semarang Timur", "Gajahmungkur"],
    "Kota Surabaya": ["Sukolilo", "Gubeng", "Tegalsari", "Genteng", "Wonokromo"],
    "Kota Yogyakarta": ["Danurejan", "Gedongtengen", "Gondokusuman", "Kotagede", "Umbulharjo"],
    "Kota Denpasar": ["Denpasar Barat", "Denpasar Timur", "Denpasar Selatan", "Denpasar Utara"],
    "Kota Medan": ["Medan Baru", "Medan Polonia", "Medan Petisah", "Medan Timur", "Medan Deli"],
    "Kota Palembang": ["Ilir Barat", "Ilir Timur", "Seberang Ulu", "Alang-Alang Lebar"],
    "Kota Samarinda": ["Samarinda Ulu", "Samarinda Ilir", "Samarinda Utara", "Sungai Kunjang"],
    "Kota Balikpapan": ["Balikpapan Selatan", "Balikpapan Timur", "Balikpapan Utara", "Balikpapan Barat"],
    "Kota Makassar": ["Tallo", "Biringkanaya", "Tamalate", "Rappocini", "Panakkukang"],
    "Kota Bandar Lampung": ["Tanjung Karang Pusat", "Tanjung Karang Timur", "Bumi Waras", "Enggal"],
    "Kota Pekanbaru": ["Senapelan", "Lima Puluh", "Tampan", "Payung Sekaki"],
    "Kota Jayapura": ["Abepura", "Heram", "Jayapura Selatan", "Jayapura Utara"],
  };

  const masterKelurahan: Record<string, string[]> = {
    Gambir: ["Gambir", "Kebon Kelapa", "Petojo Selatan", "Petojo Utara", "Cideng"],
    Menteng: ["Menteng", "Pegangsaan", "Cikini", "Gondangdia", "Kebon Sirih"],
    Coblong: ["Dago", "Lebak Siliwangi", "Cipaganti", "Sadang Serang", "Sekeloa"],
    "Bekasi Timur": ["Bekasi Jaya", "Margahayu", "Duren Jaya", "Aren Jaya"],
    Beji: ["Beji", "Beji Timur", "Kemiri Muka", "Pondok Cina"],
    Ciputat: ["Ciputat", "Cipayung", "Sawah Baru", "Jombang"],
    "Semarang Tengah": ["Pendrikan Kidul", "Pendrikan Lor", "Sekayu", "Jagalan", "Kranggan"],
    Sukolilo: ["Menur Pumpungan", "Keputih", "Semolowaru", "Medokan Semampir"],
    Danurejan: ["Bausasran", "Suryatmajan", "Tegal Panggung"],
    "Denpasar Barat": ["Dauh Puri", "Padang Sambian", "Pemecutan"],
    "Medan Baru": ["Merdeka", "Petisah Hulu", "Petisah Tengah", "Titi Rantai"],
    "Ilir Barat": ["Kertapati", "Bukit Lama", "Demang Lebar Daun"],
    "Samarinda Ulu": ["Teluk Lerong", "Air Hitam", "Sungai Dama"],
    "Balikpapan Selatan": ["Sepinggan", "Damai Baru", "Gunung Bahagia"],
    Tallo: ["Tallo", "Rappojawa", "Wala-Walaya"],
    "Tanjung Karang Pusat": ["Tanjung Karang", "Pasir Gintung", "Kalibalau"],
    Senapelan: ["Senapelan", "Kampung Bandar", "Padang Terubuk"],
    Abepura: ["Abepura", "Awiyo", "Waena"],
  };

  await prisma.setting.upsert({
    where: { key: "master_countries" },
    update: { value: masterCountries },
    create: { key: "master_countries", value: masterCountries },
  });
  await prisma.setting.upsert({
    where: { key: "master_provinces" },
    update: { value: masterProvinces },
    create: { key: "master_provinces", value: masterProvinces },
  });
  await prisma.setting.upsert({
    where: { key: "master_cities" },
    update: { value: masterCities },
    create: { key: "master_cities", value: masterCities },
  });
  await prisma.setting.upsert({
    where: { key: "master_districts" },
    update: { value: masterDistricts },
    create: { key: "master_districts", value: masterDistricts },
  });
  await prisma.setting.upsert({
    where: { key: "master_kelurahan" },
    update: { value: masterKelurahan },
    create: { key: "master_kelurahan", value: masterKelurahan },
  });

  console.log("Master data wilayah seeded");

  // ==========================================
  // DEMO VOLUNTEER OPPORTUNITY
  // ==========================================
  // Provide a volunteer opportunity tied to the demo event so the volunteer
  // discovery journey has seeded data to display.

  const volunteerOpportunity = await prisma.volunteerOpportunity.upsert({
    where: { slug: "sukarelawan-meetup-juli-2026" },
    update: {},
    create: {
      title: "Sukarelawan Meetup Juli 2026",
      slug: "sukarelawan-meetup-juli-2026",
      description: "Bantu kelancaran registrasi dan koordinasi peserta saat meetup komunitas teknologi.",
      status: "OPEN",
      registrationDeadline: new Date("2026-07-20T00:00:00+07:00"),
      activityStartDate: new Date("2026-07-25T18:00:00+07:00"),
      activityEndDate: new Date("2026-07-25T22:00:00+07:00"),
      eventId: event.id,
      createdById: member.id,
      positions: {
        create: [
          { name: "Koordinator Registrasi", description: "Membantu check-in peserta.", requiredQty: 2 },
          { name: "MC & Moderator", description: "Memandu sesi acara.", requiredQty: 1 },
        ],
      },
    },
  });

  const demoPositions = await prisma.volunteerPosition.findMany({
    where: { opportunityId: volunteerOpportunity.id },
  });
  if (demoPositions.length > 0) {
    await prisma.volunteerApplication.upsert({
      where: {
        opportunityId_userId: { opportunityId: volunteerOpportunity.id, userId: member.id },
      },
      update: {},
      create: {
        opportunityId: volunteerOpportunity.id,
        positionId: demoPositions[0].id,
        userId: member.id,
        motivation: "Saya ingin berkontribusi pada acara komunitas.",
        agreement: true,
        status: "APPLIED",
      },
    });
  }

  console.log("Demo Volunteer Opportunity seeded:", volunteerOpportunity.title);

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
