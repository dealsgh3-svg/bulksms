import crypto from 'crypto';
import { getDecryptedSettings } from '@/lib/services/settings';

const KORA_BASE_URL = process.env.KORA_BASE_URL || 'https://api.korapay.com';
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

export class GatewayNotConfiguredError extends Error {
  constructor(gateway: string) {
    super(`${gateway} is not configured. Ask an admin to add API keys in the Admin Panel.`);
    this.name = 'GatewayNotConfiguredError';
  }
}

export class GatewayRequestError extends Error {
  constructor(gateway: string, message: string) {
    super(`${gateway} error: ${message}`);
    this.name = 'GatewayRequestError';
  }
}

interface InitializePaymentParams {
  amount: number; // in GHS (major unit)
  reference: string;
  email: string;
  name?: string;
  redirectUrl: string;
  webhookUrl: string;
}

interface InitializePaymentResult {
  checkoutUrl: string;
  gatewayReference: string;
}

/**
 * Initializes a checkout-redirect transaction with Kora Pay.
 * Docs: https://developers.korapay.com/docs/checkout-redirect
 */
export async function initializeKoraPayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
  const settings = await getDecryptedSettings();
  const secretKey = settings.koraSecretKeyDecrypted || process.env.KORA_SECRET_KEY;

  if (!secretKey) {
    throw new GatewayNotConfiguredError('Kora Pay');
  }

  const res = await fetch(`${KORA_BASE_URL}/merchant/api/v1/charges/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: 'GHS',
      reference: params.reference,
      redirect_url: params.redirectUrl,
      notification_url: params.webhookUrl,
      customer: {
        email: params.email,
        name: params.name,
      },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    throw new GatewayRequestError('Kora Pay', data?.message || `HTTP ${res.status}`);
  }

  return {
    checkoutUrl: data.data.checkout_url,
    gatewayReference: data.data.reference,
  };
}

/**
 * Verifies a Kora Pay transaction by reference.
 * Docs: https://developers.korapay.com/docs/mobile-money-apis (Step 3: Verify Payment)
 */
export async function verifyKoraPayment(reference: string): Promise<{ status: 'success' | 'failed' | 'pending'; amount?: number; raw: unknown }> {
  const settings = await getDecryptedSettings();
  const secretKey = settings.koraSecretKeyDecrypted || process.env.KORA_SECRET_KEY;

  if (!secretKey) {
    throw new GatewayNotConfiguredError('Kora Pay');
  }

  const res = await fetch(`${KORA_BASE_URL}/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    throw new GatewayRequestError('Kora Pay', data?.message || `HTTP ${res.status}`);
  }

  const gatewayStatus = String(data.data?.status || '').toLowerCase();
  const status = gatewayStatus === 'success' ? 'success' : gatewayStatus === 'failed' ? 'failed' : 'pending';

  return { status, amount: data.data?.amount, raw: data };
}

/**
 * Verifies a Kora webhook signature. Per Kora's docs, the signature is an
 * HMAC-SHA256 of the JSON-stringified `data` object, signed with the
 * merchant's secret key.
 */
export async function verifyKoraWebhookSignature(payloadDataObject: unknown, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const settings = await getDecryptedSettings();
  const secretKey = settings.koraSecretKeyDecrypted || process.env.KORA_SECRET_KEY;
  if (!secretKey) return false;

  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(payloadDataObject))
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/**
 * Initializes a transaction with Paystack.
 * Docs: https://paystack.com/docs/payments/accept-payments/
 */
export async function initializePaystackPayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
  const settings = await getDecryptedSettings();
  const secretKey = settings.paystackSecretKeyDecrypted || process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new GatewayNotConfiguredError('Paystack');
  }

  // Paystack expects the amount in the smallest currency unit (pesewas for GHS).
  const amountInPesewas = Math.round(params.amount * 100);

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountInPesewas,
      currency: 'GHS',
      reference: params.reference,
      callback_url: params.redirectUrl,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    throw new GatewayRequestError('Paystack', data?.message || `HTTP ${res.status}`);
  }

  return {
    checkoutUrl: data.data.authorization_url,
    gatewayReference: data.data.reference,
  };
}

/**
 * Verifies a Paystack transaction by reference.
 * Docs: https://paystack.com/docs/payments/verify-payments/
 */
export async function verifyPaystackPayment(reference: string): Promise<{ status: 'success' | 'failed' | 'pending'; amount?: number; raw: unknown }> {
  const settings = await getDecryptedSettings();
  const secretKey = settings.paystackSecretKeyDecrypted || process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new GatewayNotConfiguredError('Paystack');
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    throw new GatewayRequestError('Paystack', data?.message || `HTTP ${res.status}`);
  }

  const gatewayStatus = String(data.data?.status || '').toLowerCase();
  const status = gatewayStatus === 'success' ? 'success' : gatewayStatus === 'failed' || gatewayStatus === 'abandoned' ? 'failed' : 'pending';

  return { status, amount: data.data?.amount, raw: data };
}

/**
 * Verifies a Paystack webhook signature: hex-encoded HMAC-SHA512 of the
 * raw request body, keyed with the merchant's secret key.
 */
export async function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const settings = await getDecryptedSettings();
  const secretKey = settings.paystackSecretKeyDecrypted || process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const expected = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export type ActiveGateway = 'KORA' | 'PAYSTACK';

export async function initializePayment(gateway: ActiveGateway, params: InitializePaymentParams): Promise<InitializePaymentResult> {
  if (gateway === 'PAYSTACK') {
    return initializePaystackPayment(params);
  }
  return initializeKoraPayment(params);
}

export async function verifyPayment(gateway: ActiveGateway, reference: string) {
  if (gateway === 'PAYSTACK') {
    return verifyPaystackPayment(reference);
  }
  return verifyKoraPayment(reference);
}
