import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import { calculateSmsPages, calculateSmsCost, generateReference, formatPhoneNumber } from '@/lib/utils';

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
    const { recipient, message, senderId } = body;

    if (!recipient || !message) {
      return NextResponse.json(
        { success: false, error: 'Recipient and message are required' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(recipient);

    // Get user wallet
    const wallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, authResult.user.id),
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 400 }
      );
    }

    // Calculate cost
    const { pages } = calculateSmsPages(message);
    const pricingTiers = {
      USER: 0.02,
      AGENT: 0.015,
      DEVELOPER: 0.012,
      ADMIN: 0.01,
    };
    const rate = pricingTiers[authResult.user.role] || 0.02;
    const cost = calculateSmsCost(pages, rate);

    // Check balance
    const balance = parseFloat(wallet.balance);
    if (balance < cost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get user's default sender ID if not specified
    let finalSenderId = senderId;
    if (!finalSenderId) {
      const defaultSender = await db.query.senderIds.findFirst({
        where: and(
          eq(schema.senderIds.userId, authResult.user.id),
          eq(schema.senderIds.isDefault, true),
          eq(schema.senderIds.status, 'APPROVED')
        ),
      });
      finalSenderId = defaultSender?.senderId || 'TextFlow';
    }

    // Create SMS log
    const [smsLog] = await db.insert(schema.smsLogs).values({
      userId: authResult.user.id,
      senderId: finalSenderId,
      recipient: formattedPhone,
      message,
      pages,
      cost: cost.toString(),
      status: 'SENT',
      provider: 'WEB',
      externalId: `MSG-${Date.now()}`,
    }).returning();

    // Deduct from wallet (transaction would be better here)
    const newBalance = balance - cost;
    await db.update(schema.wallets)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(eq(schema.wallets.id, wallet.id));

    // Create transaction record
    await db.insert(schema.transactions).values({
      walletId: wallet.id,
      type: 'DEBIT',
      amount: cost.toString(),
      balanceAfter: newBalance.toString(),
      reason: 'SMS_PURCHASE',
      description: `SMS to ${formattedPhone}`,
      reference: generateReference(),
    });

    return NextResponse.json({
      success: true,
      messageId: smsLog.id,
      cost,
      pages,
      recipient: formattedPhone,
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
