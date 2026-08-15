import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid request' }, { status: 400 });
    }

    const senderId = await db.query.senderIds.findFirst({ where: eq(schema.senderIds.id, id) });
    if (!senderId) {
      return NextResponse.json({ success: false, error: 'Sender ID not found' }, { status: 404 });
    }

    const [updated] = await db.update(schema.senderIds)
      .set({
        status: result.data.status,
        rejectionReason: result.data.status === 'REJECTED' ? result.data.rejectionReason || 'Not approved' : null,
        approvedAt: result.data.status === 'APPROVED' ? new Date() : null,
      })
      .where(eq(schema.senderIds.id, id))
      .returning();

    return NextResponse.json({ success: true, senderId: updated });
  } catch (error) {
    console.error('Review sender ID error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update sender ID' }, { status: 500 });
  }
}
