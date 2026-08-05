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

    // Get wallet balance
    const wallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, result.user.id),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        whatsappNumber: result.user.whatsappNumber,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
        whatsappVerified: result.user.whatsappVerified,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        walletBalance: wallet?.balance || '0',
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
