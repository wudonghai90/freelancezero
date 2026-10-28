/**
 * Seed script — creates a demo dataset so a fresh clone has something to look at.
 * Run with: npm run db:seed
 *
 * Idempotent-ish: uses upserts on stable keys so re-running won't duplicate.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const SKILLS = [
  ['TypeScript', 'Web Development'],
  ['React', 'Web Development'],
  ['Next.js', 'Web Development'],
  ['Node.js', 'Web Development'],
  ['UI/UX Design', 'Design'],
  ['Figma', 'Design'],
  ['Copywriting', 'Writing'],
  ['SEO', 'Marketing'],
] as const;

// 50 roots × 20 suffixes = 1,000 deterministic company names for the sign-up
// directory combobox.
const COMPANY_ROOTS = [
  'Acme', 'Globex', 'Initech', 'Hooli', 'Umbrella', 'Stark', 'Wayne', 'Cyberdyne', 'Aperture',
  'Oscorp', 'Nexon', 'Vanta', 'Lumen', 'Pinnacle', 'Vertex', 'Quantum', 'Zenith', 'Aurora',
  'Cascade', 'Summit', 'Harbor', 'Beacon', 'Catalyst', 'Dynamo', 'Ember', 'Falcon', 'Granite',
  'Horizon', 'Ironwood', 'Juniper', 'Keystone', 'Lattice', 'Meridian', 'Northstar', 'Onyx',
  'Polaris', 'Quasar', 'Ridgeline', 'Solstice', 'Tundra', 'Uplift', 'Vector', 'Willow', 'Xenial',
  'Yield', 'Zephyr', 'Cobalt', 'Sable', 'Treeline',
];
const COMPANY_SUFFIXES = [
  'Labs', 'Systems', 'Group', 'Works', 'Studio', 'Partners', 'Industries', 'Ventures',
  'Solutions', 'Collective', 'Technologies', 'Digital', 'Agency', 'Co', 'Inc', 'Consulting',
  'Dynamics', 'Networks', 'Analytics', 'Software',
];

async function main() {
  const password = await bcrypt.hash('Password123', 12);

  // Skills taxonomy
  const skills = await Promise.all(
    SKILLS.map(([name, category]) =>
      db.skill.upsert({
        where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        update: {},
        create: { name, category, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      }),
    ),
  );

  // An admin (reviews new accounts in the approval queue)
  await db.user.upsert({
    where: { email: 'admin@example.com' },
    update: { realName: '管理员', identityStatus: 'VERIFIED', identityProvider: 'manual' },
    create: {
      email: 'admin@example.com',
      name: '管理员',
      realName: '管理员',
      identityStatus: 'VERIFIED',
      identityProvider: 'manual',
      passwordHash: password,
      role: 'ADMIN',
      emailVerified: new Date(),
      approvedAt: new Date(),
    },
  });

  // A client
  const client = await db.user.upsert({
    where: { email: 'client@example.com' },
    update: { realName: '张伟', identityStatus: 'VERIFIED', identityProvider: 'manual' },
    create: {
      email: 'client@example.com',
      name: '张伟',
      realName: '张伟',
      identityStatus: 'VERIFIED',
      identityProvider: 'manual',
      passwordHash: password,
      role: 'CLIENT',
      emailVerified: new Date(),
      approvedAt: new Date(),
      clientProfile: { create: { companyName: '星澜科技', paymentVerified: true, emailVerified: true } },
    },
  });

  // A freelancer
  const freelancer = await db.user.upsert({
    where: { email: 'freelancer@example.com' },
    update: { realName: '李然', identityStatus: 'VERIFIED', identityProvider: 'manual' },
    create: {
      email: 'freelancer@example.com',
      name: '李然',
      realName: '李然',
      identityStatus: 'VERIFIED',
      identityProvider: 'manual',
      passwordHash: password,
      role: 'FREELANCER',
      emailVerified: new Date(),
      approvedAt: new Date(),
      freelancerProfile: {
        create: {
          headline: '资深全栈工程师',
          bio: '使用 React、Next.js 与 TypeScript 构建快速、可访问的 Web 应用。',
          hourlyRate: 8500,
          availability: 'OPEN_TO_WORK',
          completenessScore: 85,
          ratingAvg: 4.9,
          ratingCount: 12,
        },
      },
    },
  });

  // The company directory behind the sign-up combobox (1,000 names).
  await db.company.createMany({
    data: COMPANY_ROOTS.flatMap((root) =>
      COMPANY_SUFFIXES.map((suffix) => ({ name: `${root} ${suffix}` })),
    ),
    skipDuplicates: true,
  });

  // A job
  await db.job.upsert({
    where: { slug: 'build-a-marketing-site-demo' },
    update: {
      title: '用 Next.js 搭建营销官网',
      budgetMin: 2500000,
      budgetMax: 2500000,
    },
    create: {
      slug: 'build-a-marketing-site-demo',
      clientId: client.id,
      title: '用 Next.js 搭建营销官网',
      description:
        '需要一个快速、利于 SEO 的营销官网，包含博客与深色模式。Figma 设计稿已备好，预计约 2 周完成。',
      budgetType: 'FIXED',
      budgetMin: 2500000,
      budgetMax: 2500000,
      experience: 'EXPERT',
      estimatedDays: 14,
      status: 'OPEN',
      publishedAt: new Date(),
      skills: {
        create: skills
          .filter((s) => ['Next.js', 'React', 'TypeScript'].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  console.log('✅ Seed complete.');
  console.log('   Admin:      admin@example.com / Password123');
  console.log('   Client:     client@example.com / Password123');
  console.log('   Freelancer: freelancer@example.com / Password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
