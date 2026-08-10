import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getSettings } from '@/lib/services/settings';
import { encryptSecret, maskSecret, decryptSecret } from '@/lib/encryption';
import { updateSettingsSchema } from '@/lib/validators/payment';
import { z } from 'zod';

// Extended schema for the admin settings form, including gateway keys.
// All key fields can be null (DB stores NULL when empty) or empty string.
const optionalKeyStr = z.string().optional().nullable().transform((v) => v ?? undefined);

const adminSettingsSchema = updateSettingsSchema.extend({
  koraPublicKey: optionalKeyStr,
  koraSecretKey: optionalKeyStr,
  koraWebhookSecret: optionalKeyStr,
  paystackPublicKey: optionalKeyStr,
  paystackSecretKey: optionalKeyStr,
  paystackWebhookSecret: optionalKeyStr,
});

export async function GET() {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  const settings = await getSettings();

  return NextResponse.json({
    success: true,
    settings: {
      siteName: settings.siteName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      whatsappSupport: settings.whatsappSupport,
      socialLinks: settings.socialLinks,
      footerContent: settings.footerContent,
      copyright: settings.copyright,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      activePaymentGateway: settings.activePaymentGateway,
      pricingTiers: settings.pricingTiers,
      // Never send raw secrets to the client - only whether they're set + a masked preview.
      koraPublicKey: settings.koraPublicKey || '',
      koraSecretKeyMasked: maskSecret(decryptSecret(settings.koraSecretKey)),
      koraSecretKeySet: Boolean(settings.koraSecretKey),
      koraWebhookSecretMasked: maskSecret(decryptSecret(settings.koraWebhookSecret)),
      koraWebhookSecretSet: Boolean(settings.koraWebhookSecret),
      paystackPublicKey: settings.paystackPublicKey || '',
      paystackSecretKeyMasked: maskSecret(decryptSecret(settings.paystackSecretKey)),
      paystackSecretKeySet: Boolean(settings.paystackSecretKey),
      paystackWebhookSecretMasked: maskSecret(decryptSecret(settings.paystackWebhookSecret)),
      paystackWebhookSecretSet: Boolean(settings.paystackWebhookSecret),
    },
  });
}

export async function PUT(request: Request) {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = adminSettingsSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    // Ensure the settings row exists before updating.
    await getSettings();

    const updatePayload: Partial<typeof schema.settings.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.siteName !== undefined) updatePayload.siteName = data.siteName;
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
    if (data.faviconUrl !== undefined) updatePayload.faviconUrl = data.faviconUrl;
    if (data.primaryColor !== undefined) updatePayload.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updatePayload.secondaryColor = data.secondaryColor;
    if (data.accentColor !== undefined) updatePayload.accentColor = data.accentColor;
    if (data.whatsappSupport !== undefined) updatePayload.whatsappSupport = data.whatsappSupport;
    if (data.socialLinks !== undefined) updatePayload.socialLinks = data.socialLinks;
    if (data.footerContent !== undefined) updatePayload.footerContent = data.footerContent;
    if (data.copyright !== undefined) updatePayload.copyright = data.copyright;
    if (data.termsUrl !== undefined) updatePayload.termsUrl = data.termsUrl;
    if (data.privacyUrl !== undefined) updatePayload.privacyUrl = data.privacyUrl;
    if (data.activePaymentGateway !== undefined) updatePayload.activePaymentGateway = data.activePaymentGateway;
    if (data.emailNotifications !== undefined) updatePayload.emailNotifications = data.emailNotifications;

    if (data.pricingTiers !== undefined) {
      const current = await getSettings();
      updatePayload.pricingTiers = {
        ...(current.pricingTiers as Record<string, number>),
        ...data.pricingTiers,
      };
    }

    // Public keys are safe to store as-is.
    if (data.koraPublicKey !== undefined) updatePayload.koraPublicKey = data.koraPublicKey;
    if (data.paystackPublicKey !== undefined) updatePayload.paystackPublicKey = data.paystackPublicKey;

    // Secret keys are encrypted at rest. Only overwrite if a new, non-masked
    // value was submitted (the UI sends an empty string when unchanged).
    if (data.koraSecretKey) updatePayload.koraSecretKey = encryptSecret(data.koraSecretKey);
    if (data.koraWebhookSecret) updatePayload.koraWebhookSecret = encryptSecret(data.koraWebhookSecret);
    if (data.paystackSecretKey) updatePayload.paystackSecretKey = encryptSecret(data.paystackSecretKey);
    if (data.paystackWebhookSecret) updatePayload.paystackWebhookSecret = encryptSecret(data.paystackWebhookSecret);

    const [updated] = await db
      .update(schema.settings)
      .set(updatePayload)
      .where(eq(schema.settings.id, 1))
      .returning();

    return NextResponse.json({
      success: true,
      settings: {
        activePaymentGateway: updated.activePaymentGateway,
        koraSecretKeySet: Boolean(updated.koraSecretKey),
        paystackSecretKeySet: Boolean(updated.paystackSecretKey),
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
