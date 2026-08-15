import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, eq } from 'drizzle-orm';
import { calculateSmsPages, calculateSmsCost, formatPhoneNumber } from '@/lib/utils';
import { creditWallet, debitWallet, InsufficientBalanceError } from '@/lib/services/wallet';
import { getSettings, getSmsRateForRole } from '@/lib/services/settings';
import {
  AgooApiError,
  AgooConfigurationError,
  getAgooRuntimeConfig,
  mapAgooStatusToInternal,
  sendSingleSmsWithAgoo,
} from '@/lib/services/agoo-sms';

function getDefaultSenderId(settings?: Record<string, unknown>) {
  return String(settings?.testSenderId || process.env.SMS_GATEWAY_USER_SENDER_ID || 'SMS_GATEWAY_USER_SENDER_ID');
}

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient, message, senderId } = body;

    if (!recipient || typeof recipient !== 'string' || !message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Recipient and message are required' }, { status: 400 });
    }

    if (message.length > 480) {
      return NextResponse.json({ success: false, error: 'Agoo SMS messages are limited to 480 characters / 3 segments' }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(recipient);
    const agooConfig = await getAgooRuntimeConfig();

    let finalSenderId = typeof senderId === 'string' && senderId.trim() ? senderId.trim() : '';
    if (!finalSenderId) {
      const defaultSender = await db.query.senderIds.findFirst({
        where: and(eq(schema.senderIds.userId, authResult.user.id), eq(schema.senderIds.isDefault, true), eq(schema.senderIds.status, 'APPROVED')),
      });
      finalSenderId = defaultSender?.senderId || getDefaultSenderId(agooConfig.settings);
    }

    let upstreamMessage = message;
    if (agooConfig.keyType === 'test' && finalSenderId === getDefaultSenderId(agooConfig.settings)) {
      upstreamMessage = 'Hello from Agoo';
    }

    const { pages } = calculateSmsPages(upstreamMessage);
    const platformSettings = await getSettings();
    const rate = getSmsRateForRole(platformSettings.pricingTiers, authResult.user.role);
    const platformCost = agooConfig.keyType === 'test' ? 0 : calculateSmsCost(pages, rate);

    const walletResult = platformCost > 0
      ? await debitWallet({
          userId: authResult.user.id,
          amount: platformCost,
          reason: 'SMS_PURCHASE',
          description: `SMS to ${formattedPhone}`,
          reference: `SMS-${Date.now()}-${authResult.user.id.slice(0, 8).toUpperCase()}`,
          metadata: { channel: 'WEB', recipient: formattedPhone },
        })
      : null;

    try {
      const { response, rateLimit } = await sendSingleSmsWithAgoo({
        to: formattedPhone,
        message: upstreamMessage,
        senderId: finalSenderId,
      });

      const upstream = response.data!;
      const [smsLog] = await db.insert(schema.smsLogs).values({
        userId: authResult.user.id,
        senderId: finalSenderId,
        recipient: formattedPhone,
        message: upstreamMessage,
        pages: upstream.segments || pages,
        cost: platformCost.toString(),
        status: mapAgooStatusToInternal(upstream.status),
        provider: 'WEB',
        externalId: upstream.messageId,
      }).returning();

      return NextResponse.json({
        success: true,
        messageId: smsLog.id,
        upstreamMessageId: upstream.messageId,
        recipient: formattedPhone,
        senderId: finalSenderId,
        pages: upstream.segments || pages,
        cost: platformCost,
        upstreamCost: upstream.cost ?? 0,
        upstreamBalance: upstream.balance,
        status: upstream.status,
        rateLimit,
      });
    } catch (error) {
      // Refund the platform wallet if the upstream provider rejected or failed the send.
      if (walletResult && platformCost > 0) {
        await creditWallet({
          userId: authResult.user.id,
          amount: platformCost,
          reason: 'REFUND',
          description: `Refund for failed SMS to ${formattedPhone}`,
          reference: `REFUND-${walletResult.transaction.reference}`,
          metadata: { originalTransaction: walletResult.transaction.reference, channel: 'WEB' },
        }).catch((refundError) => console.error('SMS refund failed:', refundError));
      }
      throw error;
    }
  } catch (error) {
    console.error('Send SMS error:', error);

    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof AgooConfigurationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    if (error instanceof AgooApiError) {
      const status = error.status === 429 || error.status === 402 || error.status === 400 ? error.status : 502;
      return NextResponse.json({ success: false, error: error.message, errorCode: error.code, rateLimit: error.rateLimit }, { status });
    }

    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 });
  }
}
