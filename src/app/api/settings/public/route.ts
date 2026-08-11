import { NextResponse } from 'next/server';
import { db, schema } from '@/db';

export async function GET() {
  try {
    const settings = await db.query.settings.findFirst({
      where: (s, { eq }) => eq(s.id, 1),
    });

    if (!settings) {
      // Return defaults
      return NextResponse.json({
        siteName: 'TextFlow Pro',
        tagline: 'Enterprise SMS Made Simple',
        primaryColor: '#6366F1',
        secondaryColor: '#8B5CF6',
        accentColor: '#06B6D4',
        whatsappSupport: null,
        socialLinks: {},
        activePaymentGateway: 'KORA',
        koraConfigured: false,
        paystackConfigured: false,
        pricingTiers: { USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 },
      });
    }

    return NextResponse.json({
      siteName: settings.siteName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      whatsappSupport: settings.whatsappSupport,
      socialLinks: settings.socialLinks,
      footerContent: settings.footerContent,
      copyright: settings.copyright,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      // Public payment info only - never expose secret/webhook keys here.
      activePaymentGateway: settings.activePaymentGateway,
      koraConfigured: Boolean(settings.koraSecretKey || process.env.KORA_SECRET_KEY),
      paystackConfigured: Boolean(settings.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY),
      // Per-role SMS pricing is not sensitive - users need it to preview costs before sending.
      pricingTiers: settings.pricingTiers,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}
