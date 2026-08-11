import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, desc, eq } from 'drizzle-orm';
import { contactSchema } from '@/lib/validators/sms';
import { formatPhoneNumber } from '@/lib/utils';

export async function GET() {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const contacts = await db.query.contacts.findMany({
      where: eq(schema.contacts.userId, authResult.user.id),
      orderBy: [desc(schema.contacts.createdAt)],
      with: {
        groupContacts: {
          with: { group: { columns: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      contacts: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        tags: contact.tags as string[],
        customFields: contact.customFields as Record<string, string>,
        groups: contact.groupContacts.map((gc) => ({ id: gc.group.id, name: gc.group.name })),
        createdAt: contact.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List contacts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load contacts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid contact data' }, { status: 400 });
    }

    const phone = formatPhoneNumber(result.data.phone);

    const existing = await db.query.contacts.findFirst({
      where: and(eq(schema.contacts.userId, authResult.user.id), eq(schema.contacts.phone, phone)),
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'A contact with this phone number already exists' }, { status: 400 });
    }

    const [created] = await db.insert(schema.contacts).values({
      userId: authResult.user.id,
      phone,
      name: result.data.name || null,
      email: result.data.email || null,
      tags: result.data.tags,
      customFields: result.data.customFields,
    }).returning();

    return NextResponse.json({ success: true, contact: created });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create contact' }, { status: 500 });
  }
}
