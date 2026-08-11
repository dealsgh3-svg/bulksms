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

export const updateSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  tagline: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  whatsappSupport: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }).optional(),
  footerContent: z.string().optional(),
  copyright: z.string().optional(),
  termsUrl: z.string().url().optional().or(z.literal('')),
  privacyUrl: z.string().url().optional().or(z.literal('')),
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
