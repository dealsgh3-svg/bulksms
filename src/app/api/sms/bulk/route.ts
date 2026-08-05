import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';
import { calculateSmsPages, calculateSmsCost, generateReference, formatPhoneNumber, chunk } from '@/lib/utils';

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
    const { recipients, message, senderId, scheduleAt } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients are required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Format phone numbers
    const formattedRecipients = recipients.map(formatPhoneNumber);
    const uniqueRecipients = [...new Set(formattedRecipients)];

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
    const costPerSms = calculateSmsCost(pages, rate);
    const totalCost = costPerSms * uniqueRecipients.length;

    // Check balance
    const balance = parseFloat(wallet.balance);
    if (balance < totalCost) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Required: $${totalCost.toFixed(3)}, Available: $${balance.toFixed(3)}` },
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

    // If scheduled, create scheduled SMS record
    if (scheduleAt) {
      const [scheduled] = await db.insert(schema.scheduledSms).values({
        userId: authResult.user.id,
        senderId: finalSenderId,
        recipients: uniqueRecipients,
        message,
        pages,
        totalCost: totalCost.toString(),
        scheduledFor: new Date(scheduleAt),
        status: 'SCHEDULED',
      }).returning();

      return NextResponse.json({
        success: true,
        scheduledId: scheduled.id,
        count: uniqueRecipients.length,
        totalCost,
        scheduledFor: scheduleAt,
      });
    }

    const userId = authResult.user.id;
    
    // Create SMS logs for each recipient
    const smsLogs = await db.insert(schema.smsLogs)
      .values(
        uniqueRecipients.map((recipient) => ({
          userId,
          senderId: finalSenderId,
          recipient,
          message,
          pages,
          cost: costPerSms.toString(),
          status: 'QUEUED' as const,
          provider: 'BULK' as const,
          externalId: `MSG-${Date.now()}-${recipient}`,
        }))
      )
      .returning();

    // Deduct from wallet
    const newBalance = balance - totalCost;
    await db.update(schema.wallets)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(eq(schema.wallets.id, wallet.id));

    // Create transaction record
    await db.insert(schema.transactions).values({
      walletId: wallet.id,
      type: 'DEBIT',
      amount: totalCost.toString(),
      balanceAfter: newBalance.toString(),
      reason: 'SMS_PURCHASE',
      description: `Bulk SMS to ${uniqueRecipients.length} recipients`,
      reference: generateReference(),
    });

    return NextResponse.json({
      success: true,
      count: uniqueRecipients.length,
      totalCost,
      messageIds: smsLogs.map((log) => log.id),
    });
  } catch (error) {
    console.error('Bulk SMS error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk SMS' },
      { status: 500 }
    );
  }
}
