import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyPayment, GatewayNotConfiguredError, GatewayRequestError } from '@/lib/services/payment-gateways';
import { creditWallet } from '@/lib/services/wallet';

/**
 * Called from the wallet callback page after the user returns from the
 * gateway's checkout. This actively queries the gateway for the
 * transaction's true status and credits the wallet if needed - acting as
 * a safety net in case the webhook is delayed or never arrives (e.g. in
 * local/sandbox environments without a public webhook URL).
 */
export async function GET(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Missing reference' }, { status: 400 });
    }

    const payment = await db.query.payments.findFirst({
      where: eq(schema.payments.reference, reference),
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (payment.userId !== authResult.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ success: true, status: 'COMPLETED', amount: payment.amount });
    }

    const gatewayResult = await verifyPayment(payment.gateway, reference);

    if (gatewayResult.status === 'success') {
      const { alreadyProcessed } = await creditWallet({
        userId: payment.userId,
        amount: parseFloat(payment.amount),
        reason: 'DEPOSIT',
        description: `Wallet top-up via ${payment.gateway === 'KORA' ? 'Kora Pay' : 'Paystack'}`,
        reference: payment.reference,
        metadata: { gateway: payment.gateway, verifiedVia: 'callback' },
      });

      await db.update(schema.payments)
        .set({ status: 'COMPLETED', completedAt: new Date() })
        .where(eq(schema.payments.id, payment.id));

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        amount: payment.amount,
        alreadyProcessed,
      });
    }

    if (gatewayResult.status === 'failed') {
      await db.update(schema.payments)
        .set({ status: 'FAILED' })
        .where(eq(schema.payments.id, payment.id));

      return NextResponse.json({ success: false, status: 'FAILED', error: 'Payment was not successful' });
    }

    return NextResponse.json({ success: false, status: 'PENDING', error: 'Payment is still processing' });
  } catch (error) {
    console.error('Verify payment error:', error);

    if (error instanceof GatewayNotConfiguredError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    if (error instanceof GatewayRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 });
    }

    return NextResponse.json({ success: false, error: 'Failed to verify payment' }, { status: 500 });
  }
}
