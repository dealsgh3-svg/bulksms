import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { and, eq, sql } from 'drizzle-orm';
import { contactImportSchema } from '@/lib/validators/sms';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = contactImportSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid import data' }, { status: 400 });
    }

    const { contacts, groupName } = result.data;
    let { groupId } = result.data;

    if (!groupId && groupName) {
      const existingGroup = await db.query.groups.findFirst({
        where: and(eq(schema.groups.userId, authResult.user.id), eq(schema.groups.name, groupName)),
      });

      if (existingGroup) {
        groupId = existingGroup.id;
      } else {
        const [createdGroup] = await db.insert(schema.groups).values({
          userId: authResult.user.id,
          name: groupName,
        }).returning();
        groupId = createdGroup.id;
      }
    }

    const existingContacts = await db.query.contacts.findMany({
      where: eq(schema.contacts.userId, authResult.user.id),
      columns: { phone: true },
    });
    const existingPhones = new Set(existingContacts.map((c) => c.phone));

    let imported = 0;
    let skipped = 0;
    const invalidNumbers: string[] = [];
    const insertedIds: string[] = [];

    for (const contact of contacts) {
      // Normalize to E.164 first (handles local 0XXXXXXXXX Ghana format),
      // then validate the normalized result.
      const phone = formatPhoneNumber(contact.phone);
      if (!isValidPhoneNumber(phone)) {
        if (invalidNumbers.length < 5) invalidNumbers.push(contact.phone);
        skipped++;
        continue;
      }

      if (existingPhones.has(phone)) {
        skipped++;
        continue;
      }

      existingPhones.add(phone);

      const [created] = await db.insert(schema.contacts).values({
        userId: authResult.user.id,
        phone,
        name: contact.name || null,
        email: contact.email || null,
        tags: contact.tags || [],
      }).returning();

      insertedIds.push(created.id);
      imported++;
    }

    if (groupId && insertedIds.length > 0) {
      await db.insert(schema.groupContacts).values(
        insertedIds.map((contactId) => ({ groupId: groupId as string, contactId }))
      ).onConflictDoNothing();

      await db.update(schema.groups)
        .set({ contactCount: sql`${schema.groups.contactCount} + ${insertedIds.length}`, updatedAt: new Date() })
        .where(eq(schema.groups.id, groupId));
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      invalidNumbers,
      groupId,
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to import contacts' }, { status: 500 });
  }
}
