import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { generateToken, verifyToken, verifyPassword } from './utils';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  type: 'access' | 'refresh';
}

export interface AuthResult {
  success: boolean;
  user?: typeof schema.users.$inferSelect;
  error?: string;
}

export async function createAccessToken(user: TokenPayload): Promise<string> {
  return generateToken(user, JWT_SECRET, '15m');
}

export async function createRefreshToken(user: TokenPayload): Promise<string> {
  return generateToken(user, JWT_REFRESH_SECRET, '7d');
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  return verifyToken<TokenPayload>(token, JWT_SECRET);
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  return verifyToken<TokenPayload>(token, JWT_REFRESH_SECRET);
}

export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, payload.userId),
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function getOptionalUser() {
  try {
    const result = await getCurrentUser();
    return result;
  } catch {
    return { success: false, error: 'Not authenticated' };
  }
}

export function requireRole(...roles: string[]) {
  return async (): Promise<AuthResult> => {
    const result = await getCurrentUser();
    
    if (!result.success || !result.user) {
      return { success: false, error: 'Authentication required' };
    }

    if (!roles.includes(result.user.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    return result;
  };
}

export async function login(email: string, password: string): Promise<AuthResult & { accessToken?: string; refreshToken?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase()),
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' };
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      ...payload,
      type: 'refresh',
    };

    const accessToken = await createAccessToken(payload);
    const refreshToken = await createRefreshToken(refreshPayload);

    // Update last login
    await db.update(schema.users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, user.id));

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  whatsappNumber: string
): Promise<AuthResult & { accessToken?: string; refreshToken?: string }> {
  try {
    // Check if email exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase()),
    });

    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Check if WhatsApp number exists
    const existingWhatsApp = await db.query.users.findFirst({
      where: eq(schema.users.whatsappNumber, whatsappNumber),
    });

    if (existingWhatsApp) {
      return { success: false, error: 'WhatsApp number already registered' };
    }

    // Hash password
    const { hashPassword } = await import('./utils');
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      whatsappNumber,
      role: 'USER',
      emailVerified: false,
      whatsappVerified: false,
      isActive: true,
    }).returning();

    // Create wallet for user
    await db.insert(schema.wallets).values({
      userId: newUser.id,
      balance: '0',
    });

    // Create tokens
    const payload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      ...payload,
      type: 'refresh',
    };

    const accessToken = await createAccessToken(payload);
    const refreshToken = await createRefreshToken(refreshPayload);

    return {
      success: true,
      user: newUser,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}
