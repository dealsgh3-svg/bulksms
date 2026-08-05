import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const response = await login(email, password);

    if (!response.success) {
      return NextResponse.json(response, { status: 401 });
    }

    const { user, accessToken, refreshToken } = response;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        email: user!.email,
        fullName: user!.fullName,
        role: user!.role,
      },
    });

    successResponse.cookies.set('access_token', accessToken!, {
      ...cookieOptions,
      maxAge: 60 * 15, // 15 minutes
    });

    successResponse.cookies.set('refresh_token', refreshToken!, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return successResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
