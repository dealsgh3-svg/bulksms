import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.number().min(5, 'Minimum deposit is GH₵5').max(50000, 'Maximum deposit is GH₵50,000'),
  gateway: z.enum(['KORA', 'PAYSTACK']).optional(),
});

export const walletAdjustmentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
  type: z.enum(['CREDIT', 'DEBIT']),
  reason: z.string().min(1).max(500),
});

export const updateUserSchema = z.object({
  role: z.enum(['USER', 'AGENT', 'DEVELOPER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  whatsappVerified: z.boolean().optional(),
});

// Many settings columns are nullable in the DB, so the admin form may send
// null values back. We coerce nulls to undefined so downstream code works
// the same for both "not sent" and "sent as null".
const nullableStr = z.string().optional().nullable().transform((v) => v ?? undefined);
const nullableUrl = z.string().url().or(z.literal('')).optional().nullable().transform((v) => v ?? undefined);

export const updateSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  tagline: nullableStr,
  logoUrl: nullableUrl,
  faviconUrl: nullableUrl,
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  whatsappSupport: nullableStr,
  socialLinks: z.object({
    facebook: nullableUrl,
    twitter: nullableUrl,
    instagram: nullableUrl,
    linkedin: nullableUrl,
    youtube: nullableUrl,
  }).optional().nullable(),
  footerContent: nullableStr,
  copyright: nullableStr,
  termsUrl: nullableUrl,
  privacyUrl: nullableUrl,
  activePaymentGateway: z.enum(['KORA', 'PAYSTACK']).optional(),
  pricingTiers: z.object({
    USER: z.number().optional(),
    AGENT: z.number().optional(),
    DEVELOPER: z.number().optional(),
  }).optional(),
  emailNotifications: z.boolean().optional(),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiBaseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().min(1).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['LIVE', 'TEST']).default('LIVE'),
  ipWhitelist: z.array(z.string()).optional().default([]),
  rateLimit: z.number().min(100).max(10000).default(1000),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WalletAdjustmentInput = z.infer<typeof walletAdjustmentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;
