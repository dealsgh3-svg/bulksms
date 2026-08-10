import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyPaystackWebhookSignature } from '@/lib/services/payment-gateways';
import { creditWallet } from '@/lib/services/wallet';

/**
 * Paystack webhook handler.
 *
 * Paystack signs the raw request body with HMAC-SHA512 using the merchant
 * secret key, sent in the `x-paystack-signature` header.
 * Docs: https://paystack.com/docs/payments/webhooks/
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const isValid = await verifyPaystackWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Paystack webhook: invalid signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;
    const reference: string | undefined = data?.reference;

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Missing reference' }, { status: 400 });
    }

    const payment = await db.query.payments.findFirst({
      where: eq(schema.payments.reference, reference),
    });

    if (!payment) {
      console.warn(`Paystack webhook: no payment found for reference ${reference}`);
      return NextResponse.json({ success: true }); // Acknowledge to stop retries.
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (event === 'charge.success' && String(data.status).toLowerCase() === 'success') {
      await creditWallet({
        userId: payment.userId,
        amount: parseFloat(payment.amount),
        reason: 'DEPOSIT',
        description: 'Wallet top-up via Paystack',
        reference: payment.reference,
        metadata: { gateway: 'PAYSTACK', webhookEvent: event },
      });

      await db.update(schema.payments)
        .set({ status: 'COMPLETED', completedAt: new Date(), metadata: data })
        .where(eq(schema.payments.id, payment.id));
    } else {
      await db.update(schema.payments)
        .set({ status: 'FAILED', metadata: data })
        .where(eq(schema.payments.id, payment.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}
