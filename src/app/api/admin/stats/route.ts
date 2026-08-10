import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { db, schema } from '@/db';
import { sql, count, sum, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const authResult = await requireRole('ADMIN')();
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
    }

    // SMS stats
    const smsStats = await db
      .select({
        totalSms: count(),
        delivered: count(sql`CASE WHEN ${schema.smsLogs.status} = 'DELIVERED' THEN 1 END`),
        failed: count(sql`CASE WHEN ${schema.smsLogs.status} = 'FAILED' THEN 1 END`),
        pending: count(sql`CASE WHEN ${schema.smsLogs.status} IN ('PENDING','QUEUED','SENT') THEN 1 END`),
        totalCost: sum(schema.smsLogs.cost),
      })
      .from(schema.smsLogs);

    const s = smsStats[0];

    // Revenue from completed deposits
    const revenueStats = await db
      .select({
        totalRevenue: sum(schema.payments.amount),
        completedCount: count(),
      })
      .from(schema.payments)
      .where(eq(schema.payments.status, 'COMPLETED'));

    const r = revenueStats[0];

    // User counts by role
    const userStats = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${schema.users.isActive} = true THEN 1 END`),
        agents: count(sql`CASE WHEN ${schema.users.role} = 'AGENT' THEN 1 END`),
        developers: count(sql`CASE WHEN ${schema.users.role} = 'DEVELOPER' THEN 1 END`),
      })
      .from(schema.users);

    const u = userStats[0];

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(String(r.totalRevenue || '0')),
        smsDelivered: Number(s.delivered) || 0,
        smsFailed: Number(s.failed) || 0,
        smsPending: Number(s.pending) || 0,
        totalSms: Number(s.totalSms) || 0,
        totalUsers: Number(u.total) || 0,
        activeUsers: Number(u.active) || 0,
        agentUsers: Number(u.agents) || 0,
        developerUsers: Number(u.developers) || 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
