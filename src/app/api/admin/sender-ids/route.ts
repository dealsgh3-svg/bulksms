import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  const senderIds = await db.query.senderIds.findMany({
    orderBy: [desc(schema.senderIds.createdAt)],
    with: { user: { columns: { fullName: true, email: true } } },
  });

  return NextResponse.json({
    success: true,
    senderIds: senderIds.map((sid) => ({
      id: sid.id,
      senderId: sid.senderId,
      status: sid.status,
      isDefault: sid.isDefault,
      rejectionReason: sid.rejectionReason,
      createdAt: sid.createdAt.toISOString(),
      user: sid.user ? { fullName: sid.user.fullName, email: sid.user.email } : null,
    })),
  });
}
