import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
const { hash } = bcryptjs;

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Seeding database...');

  // ============================================
  // ROLES
  // ============================================
  console.log('Creating roles...');
  const roleNames = [
    { name: 'SUPER_ADMIN', description: 'Full platform access', isSystem: true },
    { name: 'PLATFORM_ADMIN', description: 'Platform administration', isSystem: true },
    { name: 'ORG_OWNER', description: 'Organization owner', isSystem: true },
    { name: 'ORG_ADMIN', description: 'Organization administrator', isSystem: true },
    { name: 'COMMUNITY_OWNER', description: 'Community owner', isSystem: true },
    { name: 'COMMUNITY_ADMIN', description: 'Community administrator', isSystem: true },
    { name: 'EVENT_MANAGER', description: 'Event manager scoped to community', isSystem: true },
    { name: 'MEMBER', description: 'Regular member', isSystem: true },
  ];

  const roles: Record<string, { id: string }> = {};
  for (const role of roleNames) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    roles[role.name] = created;
  }

  // ============================================
  // USERS
  // ============================================
  console.log('Creating users...');
  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@komuna.id' },
    update: {},
    create: {
      email: 'admin@komuna.id',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      username: 'superadmin',
      emailVerified: true,
      isActive: true,
    },
  });

  const platformAdmin = await prisma.user.upsert({
    where: { email: 'platform@komuna.id' },
    update: {},
    create: {
      email: 'platform@komuna.id',
      passwordHash: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      username: 'platformadmin',
      emailVerified: true,
      isActive: true,
    },
  });

  const johnDoe = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      emailVerified: true,
      isActive: true,
      location: 'Jakarta, Indonesia',
      bio: 'Tech enthusiast and community builder',
    },
  });

  const janeSmith = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      passwordHash: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      emailVerified: true,
      isActive: true,
      location: 'Bandung, Indonesia',
      bio: 'Design enthusiast and event organizer',
    },
  });

  const bobWilson = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash: userPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      username: 'bobwilson',
      emailVerified: true,
      isActive: true,
      location: 'Surabaya, Indonesia',
      bio: 'Full-stack developer and open-source contributor',
    },
  });

  const aliceBrown = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash: userPassword,
      firstName: 'Alice',
      lastName: 'Brown',
      username: 'alicebrown',
      emailVerified: true,
      isActive: true,
      location: 'Yogyakarta, Indonesia',
      bio: 'Data scientist and ML enthusiast',
    },
  });

  const charlieLee = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      passwordHash: userPassword,
      firstName: 'Charlie',
      lastName: 'Lee',
      username: 'charlielee',
      emailVerified: true,
      isActive: true,
      location: 'Bali, Indonesia',
      bio: 'Startup founder and mentor',
    },
  });

  // Assign roles
  await prisma.userRoleAssignment.createMany({
    data: [
      { userId: superAdmin.id, roleId: roles.SUPER_ADMIN.id },
      { userId: platformAdmin.id, roleId: roles.PLATFORM_ADMIN.id },
      { userId: johnDoe.id, roleId: roles.MEMBER.id },
      { userId: janeSmith.id, roleId: roles.MEMBER.id },
      { userId: bobWilson.id, roleId: roles.MEMBER.id },
      { userId: aliceBrown.id, roleId: roles.MEMBER.id },
      { userId: charlieLee.id, roleId: roles.MEMBER.id },
    ],
    skipDuplicates: true,
  });

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('Creating categories...');
  const communityCategories = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech-related communities',
      type: 'COMMUNITY',
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Business & entrepreneurship',
      type: 'COMMUNITY',
    },
    { name: 'Design', slug: 'design', description: 'Design & creative', type: 'COMMUNITY' },
    {
      name: 'Education',
      slug: 'education',
      description: 'Education & learning',
      type: 'COMMUNITY',
    },
    { name: 'Health', slug: 'health', description: 'Health & wellness', type: 'COMMUNITY' },
    { name: 'Social', slug: 'social', description: 'Social & community', type: 'COMMUNITY' },
    {
      name: 'Creative',
      slug: 'creative',
      description: 'Creative arts & culture',
      type: 'COMMUNITY',
    },
    { name: 'Sports', slug: 'sports', description: 'Sports & fitness', type: 'COMMUNITY' },
  ];

  const eventCategories = [
    {
      name: 'Workshop',
      slug: 'event-workshop',
      description: 'Hands-on learning sessions',
      type: 'EVENT',
    },
    {
      name: 'Meetup',
      slug: 'event-meetup',
      description: 'Casual community gatherings',
      type: 'EVENT',
    },
    {
      name: 'Conference',
      slug: 'event-conference',
      description: 'Large-scale conferences',
      type: 'EVENT',
    },
    { name: 'Webinar', slug: 'event-webinar', description: 'Online seminars', type: 'EVENT' },
    {
      name: 'Hackathon',
      slug: 'event-hackathon',
      description: 'Coding competitions',
      type: 'EVENT',
    },
    {
      name: 'Networking',
      slug: 'event-networking',
      description: 'Professional networking events',
      type: 'EVENT',
    },
  ];

  const orgCategories = [
    {
      name: 'Technology',
      slug: 'org-technology',
      description: 'Tech companies & startups',
      type: 'ORGANIZATION',
    },
    {
      name: 'Non-Profit',
      slug: 'org-nonprofit',
      description: 'Non-profit organizations',
      type: 'ORGANIZATION',
    },
    {
      name: 'Education',
      slug: 'org-education',
      description: 'Educational institutions',
      type: 'ORGANIZATION',
    },
    {
      name: 'Startup',
      slug: 'org-startup',
      description: 'Startup companies',
      type: 'ORGANIZATION',
    },
  ];

  for (const cat of [...communityCategories, ...eventCategories, ...orgCategories]) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ============================================
  // COMMUNITIES
  // ============================================
  console.log('Creating communities...');
  const jakartaTechCommunity = await prisma.community.upsert({
    where: { slug: 'jakarta-tech-community' },
    update: {},
    create: {
      name: 'Jakarta Tech Community',
      slug: 'jakarta-tech-community',
      description:
        'Komunitas teknologi terbesar di Jakarta. Kami mengadakan meetup, workshop, dan sharing session setiap bulan untuk para developer, designer, dan tech enthusiast.',
      shortDescription: 'Komunitas teknologi terbesar di Jakarta',
      category: 'Technology',
      location: 'Jakarta, Indonesia',
      website: 'https://jakartatech.community',
      contactEmail: 'hello@jakartatech.community',
      membershipType: 'OPEN',
      maxMembers: 5000,
      isVerified: true,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: johnDoe.id,
    },
  });

  const bandungDesignHub = await prisma.community.upsert({
    where: { slug: 'bandung-design-hub' },
    update: {},
    create: {
      name: 'Bandung Design Hub',
      slug: 'bandung-design-hub',
      description:
        'Community untuk para desainer di Bandung. Diskusi tentang UI/UX, graphic design, branding, dan kreativitas lainnya.',
      shortDescription: 'Community desainer di Bandung',
      category: 'Design',
      location: 'Bandung, Indonesia',
      membershipType: 'OPEN',
      isVerified: true,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: janeSmith.id,
    },
  });

  const startupIndonesia = await prisma.community.upsert({
    where: { slug: 'startup-indonesia' },
    update: {},
    create: {
      name: 'Startup Indonesia',
      slug: 'startup-indonesia',
      description:
        'Wadah untuk founders dan aspiring entrepreneurs di Indonesia. Berbagi pengalaman, tips, dan networking.',
      shortDescription: 'Wadah founders dan entrepreneurs Indonesia',
      category: 'Business',
      location: 'Indonesia',
      membershipType: 'REQUEST',
      isVerified: true,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: charlieLee.id,
    },
  });

  const aiIndonesia = await prisma.community.upsert({
    where: { slug: 'ai-indonesia' },
    update: {},
    create: {
      name: 'AI Indonesia',
      slug: 'ai-indonesia',
      description:
        'Komunitas Artificial Intelligence di Indonesia. Diskusi tentang machine learning, deep learning, NLP, computer vision, dan AI ethics.',
      shortDescription: 'Komunitas AI di Indonesia',
      category: 'Technology',
      location: 'Indonesia',
      membershipType: 'OPEN',
      isVerified: true,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: aliceBrown.id,
    },
  });

  const surabayaDev = await prisma.community.upsert({
    where: { slug: 'surabaya-developers' },
    update: {},
    create: {
      name: 'Surabaya Developers',
      slug: 'surabaya-developers',
      description:
        'Komunitas developer di Surabaya. Regular meetup untuk diskusi teknologi, coding, dan career growth.',
      shortDescription: 'Komunitas developer di Surabaya',
      category: 'Technology',
      location: 'Surabaya, Indonesia',
      membershipType: 'OPEN',
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      ownerId: bobWilson.id,
    },
  });

  const pendingCommunity = await prisma.community.upsert({
    where: { slug: 'bali-digital-nomads' },
    update: {},
    create: {
      name: 'Bali Digital Nomads',
      slug: 'bali-digital-nomads',
      description:
        'Community untuk digital nomads di Bali. Cocok untuk remote worker, freelancer, dan entrepreneur yang bekerja dari Bali.',
      shortDescription: 'Community digital nomads di Bali',
      category: 'Social',
      location: 'Bali, Indonesia',
      membershipType: 'OPEN',
      status: 'PENDING',
      ownerId: charlieLee.id,
    },
  });

  // Add members
  await prisma.communityMember.createMany({
    data: [
      { communityId: jakartaTechCommunity.id, userId: johnDoe.id, role: 'OWNER' },
      { communityId: jakartaTechCommunity.id, userId: bobWilson.id, role: 'ADMIN' },
      { communityId: jakartaTechCommunity.id, userId: aliceBrown.id, role: 'MEMBER' },
      { communityId: jakartaTechCommunity.id, userId: janeSmith.id, role: 'MEMBER' },
      { communityId: bandungDesignHub.id, userId: janeSmith.id, role: 'OWNER' },
      { communityId: bandungDesignHub.id, userId: johnDoe.id, role: 'MEMBER' },
      { communityId: startupIndonesia.id, userId: charlieLee.id, role: 'OWNER' },
      { communityId: startupIndonesia.id, userId: johnDoe.id, role: 'MEMBER' },
      { communityId: aiIndonesia.id, userId: aliceBrown.id, role: 'OWNER' },
      { communityId: aiIndonesia.id, userId: bobWilson.id, role: 'MEMBER' },
      { communityId: surabayaDev.id, userId: bobWilson.id, role: 'OWNER' },
      { communityId: surabayaDev.id, userId: aliceBrown.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });

  // ============================================
  // ORGANIZATIONS
  // ============================================
  console.log('Creating organizations...');
  const techCorp = await prisma.organization.upsert({
    where: { slug: 'techcorp-indonesia' },
    update: {},
    create: {
      name: 'TechCorp Indonesia',
      slug: 'techcorp-indonesia',
      description:
        'Perusahaan teknologi yang berfokus pada solusi digital untuk UMKM di Indonesia.',
      shortDescription: 'Solusi digital untuk UMKM Indonesia',
      industry: 'Technology',
      location: 'Jakarta, Indonesia',
      website: 'https://techcorp.id',
      contactEmail: 'info@techcorp.id',
      foundedAt: new Date('2020-01-01'),
      size: '50-100',
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: johnDoe.id,
    },
  });

  const eduFoundation = await prisma.organization.upsert({
    where: { slug: 'edutech-foundation' },
    update: {},
    create: {
      name: 'EduTech Foundation',
      slug: 'edutech-foundation',
      description:
        'Yayasan yang berfokus pada pendidikan teknologi untuk anak-anak dan pemuda di daerah terpencil.',
      shortDescription: 'Pendidikan teknologi untuk daerah terpencil',
      industry: 'Education',
      location: 'Yogyakarta, Indonesia',
      foundedAt: new Date('2019-06-15'),
      size: '10-50',
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      ownerId: aliceBrown.id,
    },
  });

  const startupHub = await prisma.organization.upsert({
    where: { slug: 'startup-hub-bali' },
    update: {},
    create: {
      name: 'Startup Hub Bali',
      slug: 'startup-hub-bali',
      description:
        'Coworking space dan incubator untuk startup di Bali. Menyediakan mentoring, funding connection, dan community.',
      shortDescription: 'Incubator untuk startup di Bali',
      industry: 'Startup',
      location: 'Bali, Indonesia',
      status: 'PENDING',
      ownerId: charlieLee.id,
    },
  });

  await prisma.organizationMember.createMany({
    data: [
      { organizationId: techCorp.id, userId: johnDoe.id, role: 'OWNER' },
      { organizationId: techCorp.id, userId: bobWilson.id, role: 'ADMIN' },
      { organizationId: eduFoundation.id, userId: aliceBrown.id, role: 'OWNER' },
      { organizationId: eduFoundation.id, userId: janeSmith.id, role: 'ADMIN' },
      { organizationId: startupHub.id, userId: charlieLee.id, role: 'OWNER' },
    ],
    skipDuplicates: true,
  });

  // ============================================
  // EVENTS
  // ============================================
  console.log('Creating events...');
  const meetupEvents = [
    {
      title: 'Jakarta Tech Meetup #42',
      slug: 'jakarta-tech-meetup-42',
      description:
        'Monthly meetup Jakarta Tech Community. Kali ini kita akan membahas tentang WebAssembly dan Rust untuk web development.',
      shortDescription: 'Monthly meetup - WebAssembly & Rust',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-15'),
      startTime: '18:30',
      endTime: '21:00',
      location: 'TechHub Jakarta, SCBD',
      category: 'Meetup',
      capacity: 150,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: johnDoe.id,
      isFeatured: true,
    },
    {
      title: 'UI/UX Design Workshop',
      slug: 'ui-ux-design-workshop',
      description:
        'Workshop intensif 3 hari tentang UI/UX Design menggunakan Figma. Cocok untuk pemula hingga intermediate.',
      shortDescription: 'Workshop UI/UX Design dengan Figma',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-22'),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Bandung Creative Hub',
      category: 'Workshop',
      capacity: 50,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: janeSmith.id,
    },
    {
      title: 'AI Conference Indonesia 2026',
      slug: 'ai-conference-indonesia-2026',
      description:
        'Konferensi tahunan AI terbesar di Indonesia. 50+ speaker, 2 hari penuh, membahas tren terbaru dalam AI, ML, dan Data Science.',
      shortDescription: 'Konferensi AI terbesar di Indonesia',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-11'),
      startTime: '08:00',
      endTime: '18:00',
      location: 'Jakarta Convention Center',
      category: 'Conference',
      capacity: 2000,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: superAdmin.id,
      createdById: aliceBrown.id,
      isFeatured: true,
    },
    {
      title: 'Hackathon: Solve Jakarta',
      slug: 'hackathon-solve-jakarta',
      description:
        'Hackathon 48 jam untuk menyelesaikan masalah-masalah di Jakarta menggunakan teknologi. Total hadiah 50 juta rupiah.',
      shortDescription: 'Hackathon 48 jam untuk Jakarta',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-09-22'),
      startTime: '09:00',
      endTime: '17:00',
      isOnline: false,
      location: 'TechHub Jakarta',
      category: 'Hackathon',
      capacity: 200,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: bobWilson.id,
      isFeatured: true,
    },
    {
      title: 'Startup Pitching Night',
      slug: 'startup-pitching-night',
      description:
        'Malam pitching untuk startup. 10 startup terpilih akan mempresentasikan ide mereka di depan investor dan mentor.',
      shortDescription: 'Pitching night untuk startup',
      startDate: new Date('2026-08-28'),
      endDate: new Date('2026-08-28'),
      startTime: '18:00',
      endTime: '22:00',
      location: 'Startup Hub Bali',
      category: 'Networking',
      capacity: 100,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: charlieLee.id,
    },
    {
      title: 'React Advanced Webinar',
      slug: 'react-advanced-webinar',
      description:
        'Webinar online tentang React patterns dan best practices. Cocok untuk developer yang sudah familiar dengan React.',
      shortDescription: 'Webinar React patterns & best practices',
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-10'),
      startTime: '13:00',
      endTime: '16:00',
      isOnline: true,
      onlineUrl: 'https://meet.komuna.id/react-advanced',
      category: 'Webinar',
      capacity: 500,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: bobWilson.id,
    },
    {
      title: 'Design Thinking Workshop',
      slug: 'design-thinking-workshop',
      description:
        'Workshop tentang Design Thinking methodology. Learn how to apply design thinking in your daily work.',
      shortDescription: 'Workshop Design Thinking',
      startDate: new Date('2026-08-05'),
      endDate: new Date('2026-08-05'),
      startTime: '10:00',
      endTime: '16:00',
      location: 'Bandung Design Hub',
      category: 'Workshop',
      capacity: 40,
      status: 'PENDING',
      createdById: janeSmith.id,
    },
    {
      title: 'Cloud Computing 101',
      slug: 'cloud-computing-101',
      description: 'Introduction to cloud computing. Learn AWS, GCP, and Azure basics.',
      shortDescription: 'Intro to cloud computing',
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-20'),
      startTime: '14:00',
      endTime: '17:00',
      isOnline: true,
      onlineUrl: 'https://meet.komuna.id/cloud-101',
      category: 'Webinar',
      capacity: 300,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: platformAdmin.id,
      createdById: johnDoe.id,
    },
  ];

  for (const eventData of meetupEvents) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        locationUrl: eventData.location ? undefined : undefined,
      } as never,
    });

    // Link to community
    if (eventData.slug.includes('jakarta-tech')) {
      await prisma.communityEvent.create({
        data: { communityId: jakartaTechCommunity.id, eventId: event.id },
      });
    }
    if (eventData.slug.includes('design')) {
      await prisma.communityEvent.create({
        data: { communityId: bandungDesignHub.id, eventId: event.id },
      });
    }
    if (eventData.slug.includes('ai-conference')) {
      await prisma.communityEvent.create({
        data: { communityId: aiIndonesia.id, eventId: event.id },
      });
    }
    if (eventData.slug.includes('hackathon')) {
      await prisma.communityEvent.create({
        data: { communityId: surabayaDev.id, eventId: event.id },
      });
    }
    if (eventData.slug.includes('startup-pitching')) {
      await prisma.organizationEvent.create({
        data: { organizationId: startupHub.id, eventId: event.id },
      });
    }
  }

  // ============================================
  // POSTS
  // ============================================
  console.log('Creating posts...');
  await prisma.post.createMany({
    data: [
      {
        communityId: jakartaTechCommunity.id,
        authorId: johnDoe.id,
        title: 'Welcome to Jakarta Tech Community!',
        slug: 'welcome-jakarta-tech',
        content:
          'Selamat datang di Jakarta Tech Community! Komunitas ini didirikan untuk para developer, designer, dan tech enthusiast di Jakarta. Mari berbagi ilmu dan pengalaman bersama.',
        excerpt: 'Selamat datang di Jakarta Tech Community!',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      {
        communityId: jakartaTechCommunity.id,
        authorId: bobWilson.id,
        title: 'Tips Getting Started with TypeScript',
        slug: 'tips-getting-started-typescript',
        content:
          'TypeScript menjadi semakin populer di kalangan developer. Berikut tips untuk memulai dengan TypeScript dari nol...',
        excerpt: 'Tips untuk memulai dengan TypeScript',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      {
        communityId: bandungDesignHub.id,
        authorId: janeSmith.id,
        title: 'Tren UI/UX Design 2026',
        slug: 'trend-ui-ux-design-2026',
        content:
          'Tahun 2026 membawa tren baru dalam UI/UX Design. Mari kita bahas beberapa tren yang patut diperhatikan...',
        excerpt: 'Tren UI/UX Design terbaru tahun 2026',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    ],
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        type: 'SYSTEM',
        title: 'Welcome to KomunaID!',
        message:
          'Selamat datang di KomunaID! Platform digital untuk menghubungkan individu, komunitas, dan organisasi.',
      },
      {
        userId: johnDoe.id,
        type: 'COMMUNITY',
        title: 'Community Approved',
        message: 'Komunitas "Jakarta Tech Community" Anda telah disetujui.',
      },
      {
        userId: charlieLee.id,
        type: 'COMMUNITY',
        title: 'Community Pending Approval',
        message: 'Komunitas "Bali Digital Nomads" Anda sedang menunggu persetujuan admin.',
      },
      {
        userId: aliceBrown.id,
        type: 'EVENT',
        title: 'Event Approved',
        message: 'Event "AI Conference Indonesia 2026" telah disetujui dan dipublikasikan.',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
