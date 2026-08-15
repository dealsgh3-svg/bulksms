import { z } from 'zod';

// Accepts both E.164 (+233XXXXXXXXX) and local Ghana format (0XXXXXXXXX),
// since numbers are normalized to E.164 server-side via formatPhoneNumber()
// after validation. Rejecting local format here was a bug that blocked the
// most common way Ghanaian users type phone numbers.
const phoneRegex = /^(\+?\d{7,15}|0\d{6,14})$/;

export const sendSmsSchema = z.object({
  recipient: z.string().regex(phoneRegex, 'Invalid phone number'),
  message: z.string().min(1, 'Message cannot be empty').max(10 * 160, 'Message too long'),
  senderId: z.string().min(3).max(11).optional(),
});

export const bulkSmsSchema = z.object({
  recipients: z.array(z.string().regex(phoneRegex, 'Invalid phone number')).min(1),
  message: z.string().min(1, 'Message cannot be empty').max(10 * 160, 'Message too long'),
  senderId: z.string().min(3).max(11).optional(),
  deduplicate: z.boolean().default(false),
  scheduleAt: z.string().datetime().optional(),
});

export const scheduleSmsSchema = z.object({
  recipients: z.array(z.string().regex(phoneRegex, 'Invalid phone number')).min(1),
  message: z.string().min(1).max(10 * 160),
  senderId: z.string().min(3).max(11).optional(),
  scheduledFor: z.string().datetime(),
});

export const senderIdRequestSchema = z.object({
  senderId: z.string()
    .min(3, 'Sender ID must be at least 3 characters')
    .max(11, 'Sender ID must be at most 11 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Sender ID must be alphanumeric'),
});

export const contactSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  customFields: z.record(z.string(), z.string()).optional().default({}),
});

export const contactImportSchema = z.object({
  contacts: z.array(z.object({
    phone: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).min(1),
  groupId: z.string().uuid().optional(),
  groupName: z.string().min(1).max(100).optional(),
});

export const groupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  contactIds: z.array(z.string().uuid()).optional(),
});

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type BulkSmsInput = z.infer<typeof bulkSmsSchema>;
export type ScheduleSmsInput = z.infer<typeof scheduleSmsSchema>;
export type SenderIdRequestInput = z.infer<typeof senderIdRequestSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ContactImportInput = z.infer<typeof contactImportSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
