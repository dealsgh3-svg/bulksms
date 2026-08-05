import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { generateReference } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, gateway = 'KORA' } = body;

    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit is $1' },
        { status: 400 }
      );
    }

    // Get settings for gateway configuration
    const settings = await db.query.settings.findFirst();
    const activeGateway = settings?.activePaymentGateway || 'KORA';

    // Generate reference
    const reference = `DEP-${Date.now()}-${authResult.user.id.slice(0, 8).toUpperCase()}`;

    // Create payment record
    const [payment] = await db.insert(schema.payments).values({
      userId: authResult.user.id,
      gateway: activeGateway,
      amount: amount.toString(),
      status: 'PENDING',
      reference,
    }).returning();

    // In production, you would initialize the payment with the gateway here
    // For now, we'll return a mock payment URL
    const paymentUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/wallet/pay/${payment.id}`;

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference,
      paymentUrl,
      amount,
      gateway: activeGateway,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize deposit' },
      { status: 500 }
    );
  }
}
