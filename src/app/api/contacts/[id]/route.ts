import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, eq } from 'drizzle-orm';
import { contactSchema } from '@/lib/validators/sms';
import { formatPhoneNumber } from '@/lib/utils';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = contactSchema.partial().safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid contact data' }, { status: 400 });
    }

    const existing = await db.query.contacts.findFirst({
      where: and(eq(schema.contacts.id, id), eq(schema.contacts.userId, authResult.user.id)),
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    const updatePayload: Partial<typeof schema.contacts.$inferInsert> = { updatedAt: new Date() };
    if (result.data.phone) updatePayload.phone = formatPhoneNumber(result.data.phone);
    if (result.data.name !== undefined) updatePayload.name = result.data.name || null;
    if (result.data.email !== undefined) updatePayload.email = result.data.email || null;
    if (result.data.tags !== undefined) updatePayload.tags = result.data.tags;
    if (result.data.customFields !== undefined) updatePayload.customFields = result.data.customFields;

    const [updated] = await db.update(schema.contacts)
      .set(updatePayload)
      .where(eq(schema.contacts.id, id))
      .returning();

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.query.contacts.findFirst({
      where: and(eq(schema.contacts.id, id), eq(schema.contacts.userId, authResult.user.id)),
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    await db.delete(schema.contacts).where(eq(schema.contacts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete contact' }, { status: 500 });
  }
}
