import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, desc, eq } from 'drizzle-orm';
import { senderIdRequestSchema } from '@/lib/validators/sms';

const SENDER_ID_REGISTRATION_FEE = 0; // Registration is free by default; admins can change this via pricing later.

export async function GET() {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const senderIds = await db.query.senderIds.findMany({
      where: eq(schema.senderIds.userId, authResult.user.id),
      orderBy: [desc(schema.senderIds.createdAt)],
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
        approvedAt: sid.approvedAt ? sid.approvedAt.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error('List sender IDs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load sender IDs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = senderIdRequestSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid sender ID' }, { status: 400 });
    }

    const senderId = result.data.senderId.toUpperCase();

    const existing = await db.query.senderIds.findFirst({
      where: and(eq(schema.senderIds.userId, authResult.user.id), eq(schema.senderIds.senderId, senderId)),
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already requested this Sender ID' }, { status: 400 });
    }

    // First sender ID for a user is automatically set as default once approved.
    const userSenderIdCount = await db.query.senderIds.findMany({
      where: eq(schema.senderIds.userId, authResult.user.id),
    });

    const [created] = await db.insert(schema.senderIds).values({
      userId: authResult.user.id,
      senderId,
      status: 'PENDING',
      isDefault: userSenderIdCount.length === 0,
    }).returning();

    return NextResponse.json({
      success: true,
      senderId: {
        id: created.id,
        senderId: created.senderId,
        status: created.status,
        isDefault: created.isDefault,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Request sender ID error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit sender ID request' }, { status: 500 });
  }
}
