import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { register } from '@/lib/auth';
import { registerSchema } from '@/lib/validators/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password, fullName, whatsappNumber } = result.data;

    // Check existing user
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    const response = await register(email, password, fullName, whatsappNumber);

    if (!response.success) {
      return NextResponse.json(response, { status: 400 });
    }

    const { user, accessToken, refreshToken } = response;

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    const authResponse = NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        email: user!.email,
        fullName: user!.fullName,
        role: user!.role,
      },
    });

    authResponse.cookies.set('access_token', accessToken!, {
      ...cookieOptions,
      maxAge: 60 * 15, // 15 minutes
    });

    authResponse.cookies.set('refresh_token', refreshToken!, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return authResponse;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
