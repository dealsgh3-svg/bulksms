import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq, sql, count, sum, and, gte, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const userId = authResult.user.id;

    // Total SMS sent + status breakdown
    const smsStats = await db
      .select({
        totalSms: count(),
        delivered: count(sql`CASE WHEN ${schema.smsLogs.status} = 'DELIVERED' THEN 1 END`),
        failed: count(sql`CASE WHEN ${schema.smsLogs.status} = 'FAILED' THEN 1 END`),
        pending: count(sql`CASE WHEN ${schema.smsLogs.status} IN ('PENDING','QUEUED','SENT') THEN 1 END`),
        totalCost: sum(schema.smsLogs.cost),
      })
      .from(schema.smsLogs)
      .where(eq(schema.smsLogs.userId, userId));

    const s = smsStats[0];

    // Contact count
    const contactStats = await db
      .select({ total: count() })
      .from(schema.contacts)
      .where(eq(schema.contacts.userId, userId));

    // Recent SMS
    const recentLogs = await db.query.smsLogs.findMany({
      where: eq(schema.smsLogs.userId, userId),
      orderBy: [desc(schema.smsLogs.createdAt)],
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSms: Number(s.totalSms) || 0,
        delivered: Number(s.delivered) || 0,
        failed: Number(s.failed) || 0,
        pending: Number(s.pending) || 0,
        totalSpent: parseFloat(String(s.totalCost || '0')),
        contacts: Number(contactStats[0]?.total) || 0,
      },
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        recipient: log.recipient,
        message: log.message.length > 40 ? log.message.slice(0, 40) + '...' : log.message,
        status: log.status,
        cost: log.cost,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
