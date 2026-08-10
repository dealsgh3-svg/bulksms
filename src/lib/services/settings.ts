import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { decryptSecret } from '@/lib/encryption';

export type PlatformSettings = typeof schema.settings.$inferSelect;

/**
 * Fetches the singleton settings row, creating it with defaults if it
 * doesn't exist yet (fresh database).
 */
export async function getSettings(): Promise<PlatformSettings> {
  const existing = await db.query.settings.findFirst({
    where: eq(schema.settings.id, 1),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(schema.settings)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Row was created concurrently by another request - fetch it.
  const settled = await db.query.settings.findFirst({ where: eq(schema.settings.id, 1) });
  if (!settled) throw new Error('Failed to initialize settings');
  return settled;
}

/**
 * Returns the settings row with gateway secret/webhook keys decrypted,
 * ready to use for calling upstream payment APIs. Never expose this
 * directly to the client.
 */
export async function getDecryptedSettings(): Promise<PlatformSettings & {
  koraSecretKeyDecrypted: string;
  koraWebhookSecretDecrypted: string;
  paystackSecretKeyDecrypted: string;
  paystackWebhookSecretDecrypted: string;
}> {
  const settings = await getSettings();
  return {
    ...settings,
    koraSecretKeyDecrypted: decryptSecret(settings.koraSecretKey),
    koraWebhookSecretDecrypted: decryptSecret(settings.koraWebhookSecret),
    paystackSecretKeyDecrypted: decryptSecret(settings.paystackSecretKey),
    paystackWebhookSecretDecrypted: decryptSecret(settings.paystackWebhookSecret),
  };
}
