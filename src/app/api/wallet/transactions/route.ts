import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const authResult = await getCurrentUser();
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const wallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, authResult.user.id),
    });

    if (!wallet) {
      return NextResponse.json({
        transactions: [],
      });
    }

    const transactions = await db.query.transactions.findMany({
      where: eq(schema.transactions.walletId, wallet.id),
      orderBy: [desc(schema.transactions.createdAt)],
      limit: 50,
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
