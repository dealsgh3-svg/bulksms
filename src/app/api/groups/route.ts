import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { groupSchema } from '@/lib/validators/sms';

export async function GET() {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const groups = await db.query.groups.findMany({
      where: eq(schema.groups.userId, authResult.user.id),
      orderBy: [desc(schema.groups.createdAt)],
    });

    return NextResponse.json({
      success: true,
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        contactCount: g.contactCount,
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List groups error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = groupSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid group data' }, { status: 400 });
    }

    const [created] = await db.insert(schema.groups).values({
      userId: authResult.user.id,
      name: result.data.name,
      description: result.data.description || null,
    }).returning();

    if (result.data.contactIds && result.data.contactIds.length > 0) {
      await db.insert(schema.groupContacts).values(
        result.data.contactIds.map((contactId) => ({ groupId: created.id, contactId }))
      ).onConflictDoNothing();

      await db.update(schema.groups)
        .set({ contactCount: result.data.contactIds.length })
        .where(eq(schema.groups.id, created.id));
    }

    return NextResponse.json({ success: true, group: created });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create group' }, { status: 500 });
  }
}
