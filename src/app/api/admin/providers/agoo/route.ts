import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import {
  AgooConfigurationError,
  getAgooBalance,
  getAgooProviderConfig,
  updateAgooProviderConfig,
} from '@/lib/services/agoo-sms';

const updateAgooSchema = z.object({
  apiKey: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  apiBaseUrl: z.string().url().optional(),
  testSenderId: z.string().min(1).optional(),
});

export async function GET() {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  const config = await getAgooProviderConfig();
  return NextResponse.json({ success: true, provider: config });
}

export async function PUT(request: Request) {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const normalizedBody = Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [key, value === null ? undefined : value])
    );
    const result = updateAgooSchema.safeParse(normalizedBody);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ success: false, error: firstError?.message || 'Invalid provider configuration' }, { status: 400 });
    }

    const { apiKey, isActive, apiBaseUrl, testSenderId } = result.data;

    await updateAgooProviderConfig({
      apiKey: apiKey || undefined,
      isActive,
      apiBaseUrl,
      settings: testSenderId ? { testSenderId } : undefined,
    });

    const provider = await getAgooProviderConfig();
    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Update Agoo provider error:', error);

    if (error instanceof AgooConfigurationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to save Agoo provider configuration' }, { status: 500 });
  }
}

export async function POST() {
  const authResult = await requireRole('ADMIN')();
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: 403 });
  }

  try {
    const { response, rateLimit } = await getAgooBalance();
    return NextResponse.json({ success: true, balance: response.data, rateLimit });
  } catch (error) {
    console.error('Agoo balance check error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch Agoo balance' }, { status: 502 });
  }
}
