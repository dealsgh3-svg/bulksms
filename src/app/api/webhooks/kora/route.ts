import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyKoraWebhookSignature } from '@/lib/services/payment-gateways';
import { creditWallet } from '@/lib/services/wallet';

/**
 * Kora Pay webhook handler.
 *
 * Kora signs the `data` object of the payload with HMAC-SHA256 using the
 * merchant secret key, sent in the `x-korapay-signature` header.
 * Docs: https://developers.korapay.com/docs/webhooks
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);
    const signature = request.headers.get('x-korapay-signature');

    const isValid = await verifyKoraWebhookSignature(payload.data, signature);
    if (!isValid) {
      console.warn('Kora webhook: invalid signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

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
      console.warn(`Kora webhook: no payment found for reference ${reference}`);
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
        description: 'Wallet top-up via Kora Pay',
        reference: payment.reference,
        metadata: { gateway: 'KORA', webhookEvent: event },
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
    console.error('Kora webhook error:', error);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}
