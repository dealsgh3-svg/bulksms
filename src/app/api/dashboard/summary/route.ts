import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDay(date: Date) {
  return date.toLocaleDateString('en-GH', { weekday: 'short' });
}

export async function GET(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
    const periodStart = startOfDay(new Date());
    periodStart.setDate(periodStart.getDate() - (days - 1));

    const [summary] = await db
      .select({
        totalSms: sql<number>`count(*)::int`,
        delivered: sql<number>`count(*) filter (where ${schema.smsLogs.status} = 'DELIVERED')::int`,
        failed: sql<number>`count(*) filter (where ${schema.smsLogs.status} in ('FAILED', 'REJECTED'))::int`,
        pending: sql<number>`count(*) filter (where ${schema.smsLogs.status} in ('PENDING', 'QUEUED', 'SENT'))::int`,
        totalSpent: sql<string>`coalesce(sum(${schema.smsLogs.cost}), 0)::text`,
      })
      .from(schema.smsLogs)
      .where(eq(schema.smsLogs.userId, userId));

    const [contactSummary] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.contacts)
      .where(eq(schema.contacts.userId, userId));

    const [groupSummary] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.groups)
      .where(eq(schema.groups.userId, userId));

    const recentLogs = await db.query.smsLogs.findMany({
      where: eq(schema.smsLogs.userId, userId),
      orderBy: [desc(schema.smsLogs.createdAt)],
      limit: 5,
    });

    // Only retrieve the seven-day window for the chart. Aggregation is done
    // in application memory to keep the response shape simple and portable.
    const recentWindowLogs = await db.query.smsLogs.findMany({
      where: and(eq(schema.smsLogs.userId, userId), gte(schema.smsLogs.createdAt, periodStart)),
      columns: {
        createdAt: true,
        provider: true,
      },
    });

    const chartData = Array.from({ length: days }, (_, index) => {
      const day = new Date(periodStart);
      day.setDate(periodStart.getDate() + index);
      return {
        name: formatDay(day),
        sms: 0,
        api: 0,
      };
    });

    for (const log of recentWindowLogs) {
      const logDay = startOfDay(new Date(log.createdAt));
      const dayIndex = Math.round((logDay.getTime() - periodStart.getTime()) / 86_400_000);
      if (dayIndex < 0 || dayIndex >= days) continue;
      if (log.provider === 'API') chartData[dayIndex].api += 1;
      else chartData[dayIndex].sms += 1;
    }

    const totalSms = Number(summary?.totalSms || 0);
    const deliveryData = totalSms > 0
      ? [
          { name: 'Delivered', value: Number(summary?.delivered || 0) },
          { name: 'Failed', value: Number(summary?.failed || 0) },
          { name: 'Pending', value: Number(summary?.pending || 0) },
        ].filter((item) => item.value > 0)
      : [];

    return NextResponse.json({
      success: true,
      stats: {
        totalSms,
        delivered: Number(summary?.delivered || 0),
        failed: Number(summary?.failed || 0),
        pending: Number(summary?.pending || 0),
        totalSpent: Number(summary?.totalSpent || 0),
        contacts: Number(contactSummary?.total || 0),
        groups: Number(groupSummary?.total || 0),
      },
      chartData,
      deliveryData,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        recipient: log.recipient,
        message: log.message.length > 42 ? `${log.message.slice(0, 42)}…` : log.message,
        status: log.status,
        cost: log.cost,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
