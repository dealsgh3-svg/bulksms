import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, eq } from 'drizzle-orm';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const senderId = await db.query.senderIds.findFirst({
      where: and(eq(schema.senderIds.id, id), eq(schema.senderIds.userId, authResult.user.id)),
    });

    if (!senderId) {
      return NextResponse.json({ success: false, error: 'Sender ID not found' }, { status: 404 });
    }

    if (senderId.status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Only approved Sender IDs can be set as default' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.update(schema.senderIds)
        .set({ isDefault: false })
        .where(eq(schema.senderIds.userId, authResult.user!.id));

      await tx.update(schema.senderIds)
        .set({ isDefault: true })
        .where(eq(schema.senderIds.id, senderId.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set default sender ID error:', error);
    return NextResponse.json({ success: false, error: 'Failed to set default sender ID' }, { status: 500 });
  }
}
