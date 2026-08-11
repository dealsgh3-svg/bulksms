import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { decryptSecret, encryptSecret, maskSecret } from '@/lib/encryption';

export const AGOO_PROVIDER_CODE = 'AGOO_SMS';
export const AGOO_BASE_URL = 'https://api.agoosms.com';

export type AgooProviderConfig = {
  id?: string;
  name: string;
  code: string;
  apiBaseUrl: string;
  apiKeyMasked: string;
  apiKeySet: boolean;
  keyType: 'test' | 'live' | 'unknown';
  isActive: boolean;
  priority: number | null;
  settings: Record<string, unknown>;
};

export type AgooSendResponse = {
  success: boolean;
  data?: {
    messageId: string;
    to?: string;
    segments: number;
    cost?: number;
    balance?: number;
    status: 'SENDING' | 'COMPLETED' | 'FAILED' | 'SIMULATED' | string;
    recipientCount?: number;
    totalCost?: number;
  };
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
};

export class AgooConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgooConfigurationError';
  }
}

export class AgooApiError extends Error {
  status: number;
  code: string;
  rateLimit?: AgooRateLimitInfo;

  constructor(status: number, code: string, message: string, rateLimit?: AgooRateLimitInfo) {
    super(message);
    this.name = 'AgooApiError';
    this.status = status;
    this.code = code;
    this.rateLimit = rateLimit;
  }
}

export type AgooRateLimitInfo = {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
};

function detectKeyType(apiKey: string): 'test' | 'live' | 'unknown' {
  if (apiKey.startsWith('agoo_test_')) return 'test';
  if (apiKey.startsWith('agoo_live_')) return 'live';
  return 'unknown';
}

function readRateLimit(headers: Headers): AgooRateLimitInfo {
  const parse = (value: string | null) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    limit: parse(headers.get('X-RateLimit-Limit')),
    remaining: parse(headers.get('X-RateLimit-Remaining')),
    reset: parse(headers.get('X-RateLimit-Reset')),
  };
}

export function normalizeAgooPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('233')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`;
  if (phone.trim().startsWith('+233')) return phone.trim();
  return `+233${cleaned}`;
}

export function mapAgooStatusToInternal(status: string): 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REJECTED' {
  switch (status) {
    case 'SIMULATED':
    case 'COMPLETED':
      return 'DELIVERED';
    case 'SENDING':
    case 'SENT':
      return 'SENT';
    case 'PENDING':
    case 'SCHEDULED':
      return 'PENDING';
    case 'FAILED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

export async function ensureAgooProvider() {
  const existing = await db.query.smsProviders.findFirst({
    where: eq(schema.smsProviders.code, AGOO_PROVIDER_CODE),
  });

  if (existing) return existing;

  const [created] = await db.insert(schema.smsProviders).values({
    name: 'Agoo SMS',
    code: AGOO_PROVIDER_CODE,
    apiBaseUrl: AGOO_BASE_URL,
    isActive: true,
    priority: 1,
    settings: {
      testSenderId: process.env.SMS_GATEWAY_USER_SENDER_ID || 'SMS_GATEWAY_USER_SENDER_ID',
      maxRecipients: 1000,
      maxCharacters: 480,
    },
  }).returning();

  return created;
}

export async function getAgooProviderConfig(): Promise<AgooProviderConfig> {
  const provider = await ensureAgooProvider();
  const apiKey = decryptSecret(provider.apiKey);

  return {
    id: provider.id,
    name: provider.name,
    code: provider.code,
    apiBaseUrl: provider.apiBaseUrl || AGOO_BASE_URL,
    apiKeyMasked: maskSecret(apiKey),
    apiKeySet: Boolean(apiKey),
    keyType: detectKeyType(apiKey),
    isActive: provider.isActive,
    priority: provider.priority,
    settings: (provider.settings || {}) as Record<string, unknown>,
  };
}

export async function updateAgooProviderConfig(input: {
  apiKey?: string;
  isActive?: boolean;
  apiBaseUrl?: string;
  settings?: Record<string, unknown>;
}) {
  const provider = await ensureAgooProvider();
  const updatePayload: Partial<typeof schema.smsProviders.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.apiKey) {
    const type = detectKeyType(input.apiKey);
    if (type === 'unknown') {
      throw new AgooConfigurationError('Agoo API key must start with agoo_test_ or agoo_live_');
    }
    updatePayload.apiKey = encryptSecret(input.apiKey);
  }

  if (typeof input.isActive === 'boolean') updatePayload.isActive = input.isActive;
  if (input.apiBaseUrl) updatePayload.apiBaseUrl = input.apiBaseUrl;
  if (input.settings) {
    updatePayload.settings = {
      ...((provider.settings || {}) as Record<string, unknown>),
      ...input.settings,
    };
  }

  const [updated] = await db.update(schema.smsProviders)
    .set(updatePayload)
    .where(eq(schema.smsProviders.id, provider.id))
    .returning();

  return updated;
}

export async function getAgooRuntimeConfig() {
  const provider = await ensureAgooProvider();
  const apiKey = decryptSecret(provider.apiKey);

  if (!provider.isActive) {
    throw new AgooConfigurationError('Agoo SMS provider is disabled in the Admin Panel.');
  }

  if (!apiKey) {
    throw new AgooConfigurationError('Agoo SMS API key is not configured. Add it in Admin Panel → Providers.');
  }

  const keyType = detectKeyType(apiKey);
  if (keyType === 'unknown') {
    throw new AgooConfigurationError('Configured Agoo SMS API key is invalid. It must start with agoo_test_ or agoo_live_.');
  }

  return {
    provider,
    apiKey,
    apiBaseUrl: provider.apiBaseUrl || AGOO_BASE_URL,
    keyType,
    settings: (provider.settings || {}) as Record<string, unknown>,
  };
}

async function callAgoo(path: string, init: RequestInit): Promise<{ response: AgooSendResponse; rateLimit: AgooRateLimitInfo }> {
  const { apiKey, apiBaseUrl } = await getAgooRuntimeConfig();
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...(init.headers || {}),
    },
  });

  const rateLimit = readRateLimit(res.headers);
  const payload = await res.json().catch(() => null) as AgooSendResponse | null;

  if (!res.ok || !payload?.success) {
    const code = payload?.error?.code || `HTTP_${res.status}`;
    const message = payload?.error?.message || `Agoo SMS request failed with status ${res.status}`;
    throw new AgooApiError(res.status, code, message, rateLimit);
  }

  return { response: payload, rateLimit };
}

export async function sendSingleSmsWithAgoo(input: { to: string; message: string; senderId: string }) {
  return callAgoo('/v1/sms/send', {
    method: 'POST',
    body: JSON.stringify({
      to: input.to,
      message: input.message,
      senderId: input.senderId,
    }),
  });
}

export async function sendBulkSmsWithAgoo(input: { recipients: string[]; message: string; senderId: string }) {
  return callAgoo('/v1/sms/send-bulk', {
    method: 'POST',
    body: JSON.stringify({
      recipients: input.recipients,
      message: input.message,
      senderId: input.senderId,
    }),
  });
}

export async function getAgooMessageDetails(messageId: string) {
  return callAgoo(`/v1/sms/${encodeURIComponent(messageId)}`, { method: 'GET' });
}

export async function getAgooMessageStatus(messageId: string) {
  return callAgoo(`/v1/sms/${encodeURIComponent(messageId)}/status`, { method: 'GET' });
}

export async function getAgooBalance() {
  return callAgoo('/v1/balance', { method: 'GET' });
}
