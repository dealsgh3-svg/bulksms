import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await getCurrentUser();
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const wallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, result.user.id),
    });

    return NextResponse.json({
      success: true,
      balance: wallet?.balance || '0.00',
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
