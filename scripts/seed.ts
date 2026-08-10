import 'dotenv/config';
import { db, schema } from '../src/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seed() {
  console.log('🌱 Seeding database...');

  // ---- Demo User ----
  const demoEmail = 'demo@textflowpro.gh';
  const demoPassword = 'Demo1234';

  const existingDemo = await db.query.users.findFirst({
    where: eq(schema.users.email, demoEmail),
  });

  let demoUserId: string;

  if (existingDemo) {
    console.log('ℹ️  Demo user already exists, updating password...');
    const passwordHash = await hashPassword(demoPassword);
    await db.update(schema.users)
      .set({ passwordHash, role: 'USER', isActive: true, emailVerified: true, whatsappVerified: true })
      .where(eq(schema.users.id, existingDemo.id));
    demoUserId = existingDemo.id;
  } else {
    const passwordHash = await hashPassword(demoPassword);
    const [demoUser] = await db.insert(schema.users).values({
      email: demoEmail,
      passwordHash,
      fullName: 'Kwame Demo',
      whatsappNumber: '+233241111111',
      role: 'USER',
      emailVerified: true,
      whatsappVerified: true,
      isActive: true,
    }).returning();
    demoUserId = demoUser.id;
    console.log('✅ Created demo user');
  }

  // Ensure demo wallet exists with balance
  const demoWallet = await db.query.wallets.findFirst({
    where: eq(schema.wallets.userId, demoUserId),
  });
  if (!demoWallet) {
    await db.insert(schema.wallets).values({
      userId: demoUserId,
      balance: '250.00',
    });
    console.log('✅ Created demo wallet with GH₵250.00');
  } else {
    await db.update(schema.wallets)
      .set({ balance: '250.00' })
      .where(eq(schema.wallets.id, demoWallet.id));
    console.log('✅ Updated demo wallet to GH₵250.00');
  }

  // ---- Admin User ----
  const adminEmail = 'admin@textflowpro.gh';
  const adminPassword = 'Admin1234';

  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });

  let adminUserId: string;

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, updating password and role...');
    const passwordHash = await hashPassword(adminPassword);
    await db.update(schema.users)
      .set({ passwordHash, role: 'ADMIN', isActive: true, emailVerified: true, whatsappVerified: true })
      .where(eq(schema.users.id, existingAdmin.id));
    adminUserId = existingAdmin.id;
  } else {
    const passwordHash = await hashPassword(adminPassword);
    const [adminUser] = await db.insert(schema.users).values({
      email: adminEmail,
      passwordHash,
      fullName: 'Ama Admin',
      whatsappNumber: '+233242222222',
      role: 'ADMIN',
      emailVerified: true,
      whatsappVerified: true,
      isActive: true,
    }).returning();
    adminUserId = adminUser.id;
    console.log('✅ Created admin user');
  }

  // Ensure admin wallet exists
  const adminWallet = await db.query.wallets.findFirst({
    where: eq(schema.wallets.userId, adminUserId),
  });
  if (!adminWallet) {
    await db.insert(schema.wallets).values({
      userId: adminUserId,
      balance: '10000.00',
    });
    console.log('✅ Created admin wallet with GH₵10,000.00');
  }

  // ---- Platform Settings singleton ----
  const existingSettings = await db.query.settings.findFirst();
  if (!existingSettings) {
    await db.insert(schema.settings).values({
      id: 1,
      siteName: 'TextFlow Pro',
      tagline: 'Bulk SMS for Ghanaian Businesses',
      primaryColor: '#006B3F',
      secondaryColor: '#FCD116',
      accentColor: '#CE1126',
      whatsappSupport: '+233241234567',
      activePaymentGateway: 'KORA',
      pricingTiers: { USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 },
    });
    console.log('✅ Created platform settings');
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  DEMO USER                                  │');
  console.log('│  Email:    demo@textflowpro.gh              │');
  console.log('│  Password: Demo1234                         │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  ADMIN USER                                 │');
  console.log('│  Email:    admin@textflowpro.gh             │');
  console.log('│  Password: Admin1234                        │');
  console.log('└─────────────────────────────────────────────┘');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
