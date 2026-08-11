import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, eq } from 'drizzle-orm';
import { AgooApiError, AgooConfigurationError, getAgooMessageStatus, mapAgooStatusToInternal } from '@/lib/services/agoo-sms';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const log = await db.query.smsLogs.findFirst({
      where: and(eq(schema.smsLogs.id, id), eq(schema.smsLogs.userId, authResult.user.id)),
    });

    if (!log) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    if (!log.externalId) {
      return NextResponse.json({ success: false, error: 'Message has no upstream Agoo ID yet' }, { status: 400 });
    }

    const { response, rateLimit } = await getAgooMessageStatus(log.externalId);
    const upstreamStatus = String(response.data?.status || 'PENDING');
    const internalStatus = mapAgooStatusToInternal(upstreamStatus);

    await db.update(schema.smsLogs)
      .set({
        status: internalStatus,
        deliveredAt: internalStatus === 'DELIVERED' ? new Date() : log.deliveredAt,
      })
      .where(eq(schema.smsLogs.id, log.id));

    return NextResponse.json({ success: true, data: response.data, meta: response.meta, rateLimit });
  } catch (error) {
    console.error('Get SMS status error:', error);

    if (error instanceof AgooConfigurationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    if (error instanceof AgooApiError) {
      return NextResponse.json({ success: false, error: { code: error.code, message: error.message }, rateLimit: error.rateLimit }, { status: error.status });
    }

    return NextResponse.json({ success: false, error: 'Failed to fetch message status' }, { status: 500 });
  }
}
