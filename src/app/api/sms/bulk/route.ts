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
  sendBulkSmsWithAgoo,
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
    const { recipients, message, senderId, scheduleAt } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'Recipients are required' }, { status: 400 });
    }

    if (recipients.length > 1000) {
      return NextResponse.json({ success: false, error: 'Agoo SMS bulk requests support up to 1,000 recipients' }, { status: 400 });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 480) {
      return NextResponse.json({ success: false, error: 'Agoo SMS messages are limited to 480 characters / 3 segments' }, { status: 400 });
    }

    const formattedRecipients = [...new Set(recipients.map((recipient) => formatPhoneNumber(String(recipient))))];
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
    const costPerSms = agooConfig.keyType === 'test' ? 0 : calculateSmsCost(pages, rate);
    const totalCost = costPerSms * formattedRecipients.length;

    if (scheduleAt) {
      const [scheduled] = await db.insert(schema.scheduledSms).values({
        userId: authResult.user.id,
        senderId: finalSenderId,
        recipients: formattedRecipients,
        message: upstreamMessage,
        pages,
        totalCost: totalCost.toString(),
        scheduledFor: new Date(scheduleAt),
        status: 'SCHEDULED',
      }).returning();

      return NextResponse.json({
        success: true,
        scheduledId: scheduled.id,
        count: formattedRecipients.length,
        totalCost,
        scheduledFor: scheduleAt,
      });
    }

    const walletResult = totalCost > 0
      ? await debitWallet({
          userId: authResult.user.id,
          amount: totalCost,
          reason: 'SMS_PURCHASE',
          description: `Bulk SMS to ${formattedRecipients.length} recipients`,
          reference: `BULK-SMS-${Date.now()}-${authResult.user.id.slice(0, 8).toUpperCase()}`,
          metadata: { channel: 'BULK', recipientCount: formattedRecipients.length },
        })
      : null;

    try {
      const { response, rateLimit } = await sendBulkSmsWithAgoo({
        recipients: formattedRecipients,
        message: upstreamMessage,
        senderId: finalSenderId,
      });

      const upstream = response.data!;
      const status = mapAgooStatusToInternal(upstream.status);
      const logs = await db.insert(schema.smsLogs).values(
        formattedRecipients.map((recipient) => ({
          userId: authResult.user!.id,
          senderId: finalSenderId,
          recipient,
          message: upstreamMessage,
          pages: upstream.segments || pages,
          cost: costPerSms.toString(),
          status,
          provider: 'BULK' as const,
          externalId: upstream.messageId,
        }))
      ).returning();

      return NextResponse.json({
        success: true,
        count: formattedRecipients.length,
        totalCost,
        costPerSms,
        upstreamMessageId: upstream.messageId,
        upstreamCost: upstream.totalCost ?? 0,
        upstreamBalance: upstream.balance,
        status: upstream.status,
        messageIds: logs.map((log) => log.id),
        rateLimit,
      });
    } catch (error) {
      if (walletResult && totalCost > 0) {
        await creditWallet({
          userId: authResult.user.id,
          amount: totalCost,
          reason: 'REFUND',
          description: `Refund for failed bulk SMS to ${formattedRecipients.length} recipients`,
          reference: `REFUND-${walletResult.transaction.reference}`,
          metadata: { originalTransaction: walletResult.transaction.reference, channel: 'BULK' },
        }).catch((refundError) => console.error('Bulk SMS refund failed:', refundError));
      }
      throw error;
    }
  } catch (error) {
    console.error('Bulk SMS error:', error);

    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (error instanceof AgooConfigurationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    if (error instanceof AgooApiError) {
      const status = error.status === 429 || error.status === 402 || error.status === 400 ? error.status : 502;
      return NextResponse.json({ success: false, error: { code: error.code, message: error.message }, rateLimit: error.rateLimit }, { status });
    }

    return NextResponse.json({ success: false, error: 'Failed to send bulk SMS' }, { status: 500 });
  }
}
