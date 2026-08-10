import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { depositSchema } from '@/lib/validators/payment';
import { getSettings } from '@/lib/services/settings';
import {
  initializePayment,
  GatewayNotConfiguredError,
  GatewayRequestError,
} from '@/lib/services/payment-gateways';

function getBaseUrl(request: Request): string {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return process.env.APP_URL || 'http://localhost:3000';
}

export async function POST(request: Request) {
  let paymentId: string | null = null;

  try {
    const authResult = await getCurrentUser();

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = depositSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid deposit request' },
        { status: 400 }
      );
    }

    const { amount } = result.data;
    const settings = await getSettings();
    const activeGateway = settings.activePaymentGateway;

    const reference = `DEP-${Date.now()}-${authResult.user.id.slice(0, 8).toUpperCase()}`;
    const baseUrl = getBaseUrl(request);

    // Create the pending payment record first so the webhook/callback has
    // something to reconcile against even if the redirect never completes.
    const [payment] = await db.insert(schema.payments).values({
      userId: authResult.user.id,
      gateway: activeGateway,
      amount: amount.toString(),
      currency: 'GHS',
      status: 'PENDING',
      reference,
    }).returning();

    paymentId = payment.id;

    const { checkoutUrl, gatewayReference } = await initializePayment(activeGateway, {
      amount,
      reference,
      email: authResult.user.email,
      name: authResult.user.fullName,
      redirectUrl: `${baseUrl}/dashboard/wallet/callback?reference=${encodeURIComponent(reference)}`,
      webhookUrl: `${baseUrl}/api/webhooks/${activeGateway.toLowerCase()}`,
    });

    await db.update(schema.payments)
      .set({ gatewayReference })
      .where(eq(schema.payments.id, payment.id));

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference,
      paymentUrl: checkoutUrl,
      amount,
      gateway: activeGateway,
    });
  } catch (error) {
    console.error('Deposit error:', error);

    // Mark the pending payment record as failed so it doesn't linger.
    if (paymentId) {
      await db.update(schema.payments)
        .set({ status: 'FAILED' })
        .where(eq(schema.payments.id, paymentId))
        .catch(() => undefined);
    }

    if (error instanceof GatewayNotConfiguredError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    if (error instanceof GatewayRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initialize deposit' },
      { status: 500 }
    );
  }
}
