import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

function startOfMonth(date: Date) {
  const value = new Date(date);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonthOffset(date: Date, offset: number) {
  const value = new Date(date);
  value.setDate(1);
  value.setMonth(value.getMonth() + offset);
  value.setHours(0, 0, 0, 0);
  return value;
}

export async function GET() {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  try {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [revenueSummary] = await db
      .select({
        lifetime: sql<string>`coalesce(sum(${schema.payments.amount}), 0)::text`,
        monthly: sql<string>`coalesce(sum(${schema.payments.amount}) filter (where ${schema.payments.createdAt} >= ${monthStart.toISOString()}), 0)::text`,
      })
      .from(schema.payments)
      .where(eq(schema.payments.status, 'COMPLETED'));

    const [smsSummary] = await db
      .select({
        delivered: sql<number>`count(*) filter (where ${schema.smsLogs.status} = 'DELIVERED')::int`,
        failed: sql<number>`count(*) filter (where ${schema.smsLogs.status} in ('FAILED', 'REJECTED'))::int`,
        pending: sql<number>`count(*) filter (where ${schema.smsLogs.status} in ('PENDING', 'QUEUED', 'SENT'))::int`,
      })
      .from(schema.smsLogs);

    const [userSummary] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${schema.users.isActive} = true)::int`,
        agents: sql<number>`count(*) filter (where ${schema.users.role} = 'AGENT')::int`,
        developers: sql<number>`count(*) filter (where ${schema.users.role} = 'DEVELOPER')::int`,
      })
      .from(schema.users);

    const recentTransactions = await db
      .select({
        id: schema.transactions.id,
        userEmail: schema.users.email,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        reason: schema.transactions.reason,
        createdAt: schema.transactions.createdAt,
      })
      .from(schema.transactions)
      .leftJoin(schema.wallets, eq(schema.transactions.walletId, schema.wallets.id))
      .leftJoin(schema.users, eq(schema.wallets.userId, schema.users.id))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(8);

    const recentSms = await db.query.smsLogs.findMany({
      orderBy: [desc(schema.smsLogs.createdAt)],
      limit: 2000,
      columns: { createdAt: true, provider: true, status: true },
    });

    const revenueChartData = Array.from({ length: 6 }, (_, index) => {
      const start = startOfMonthOffset(now, index - 5);
      return {
        name: start.toLocaleDateString('en-GH', { month: 'short' }),
        revenue: 0,
      };
    });

    const sixMonthsAgo = startOfMonthOffset(now, -5);
    const recentPayments = await db.query.payments.findMany({
      where: and(eq(schema.payments.status, 'COMPLETED'), gte(schema.payments.createdAt, sixMonthsAgo)),
      columns: { amount: true, createdAt: true },
    });

    for (const payment of recentPayments) {
      const paymentDate = new Date(payment.createdAt);
      const monthIndex = (paymentDate.getFullYear() - sixMonthsAgo.getFullYear()) * 12 + paymentDate.getMonth() - sixMonthsAgo.getMonth();
      if (monthIndex >= 0 && monthIndex < revenueChartData.length) {
        revenueChartData[monthIndex].revenue += parseFloat(payment.amount);
      }
    }

    const smsChartData = (['WEB', 'API', 'BULK'] as const).map((channel) => ({
      name: channel === 'WEB' ? 'Web' : channel,
      delivered: recentSms.filter((log) => log.provider === channel && log.status === 'DELIVERED').length,
      failed: recentSms.filter((log) => log.provider === channel && (log.status === 'FAILED' || log.status === 'REJECTED')).length,
    })).filter((channel) => channel.delivered > 0 || channel.failed > 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: Number(revenueSummary?.lifetime || 0),
        monthlyRevenue: Number(revenueSummary?.monthly || 0),
        smsDelivered: Number(smsSummary?.delivered || 0),
        smsFailed: Number(smsSummary?.failed || 0),
        smsPending: Number(smsSummary?.pending || 0),
        totalUsers: Number(userSummary?.total || 0),
        activeUsers: Number(userSummary?.active || 0),
        agentUsers: Number(userSummary?.agents || 0),
        developerUsers: Number(userSummary?.developers || 0),
      },
      revenueChartData,
      smsChartData,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        userEmail: tx.userEmail || 'Unknown user',
        type: tx.type,
        amount: tx.amount,
        reason: tx.reason,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load admin analytics' }, { status: 500 });
  }
}
