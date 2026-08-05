import { pgTable, pgEnum, uuid, varchar, text, boolean, decimal, timestamp, integer, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['USER', 'AGENT', 'DEVELOPER', 'ADMIN']);
export const transactionTypeEnum = pgEnum('transaction_type', ['CREDIT', 'DEBIT']);
export const transactionReasonEnum = pgEnum('transaction_reason', ['DEPOSIT', 'SMS_PURCHASE', 'REFUND', 'ADMIN_CREDIT', 'ADMIN_DEBIT', 'TRANSFER_IN', 'TRANSFER_OUT']);
export const smsStatusEnum = pgEnum('sms_status', ['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'REJECTED']);
export const smsProviderEnum = pgEnum('sms_provider', ['WEB', 'API', 'BULK']);
export const senderIdStatusEnum = pgEnum('sender_id_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const apiKeyTypeEnum = pgEnum('api_key_type', ['LIVE', 'TEST']);
export const paymentGatewayEnum = pgEnum('payment_gateway', ['KORA', 'PAYSTACK']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']);
export const providerStatusEnum = pgEnum('provider_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull().unique(),
  role: userRoleEnum('role').default('USER').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  whatsappVerified: boolean('whatsapp_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role),
]);

// Wallets Table
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 18, scale: 6 }).default('0').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 18, scale: 6 }).notNull(),
  reason: transactionReasonEnum('reason').notNull(),
  description: text('description'),
  reference: varchar('reference', { length: 255 }).notNull().unique(),
  adminId: uuid('admin_id').references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('transactions_wallet_idx').on(table.walletId),
  index('transactions_type_idx').on(table.type),
  index('transactions_reference_idx').on(table.reference),
  index('transactions_created_idx').on(table.createdAt),
]);

// SMS Logs Table
export const smsLogs = pgTable('sms_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  senderId: varchar('sender_id', { length: 11 }).notNull(),
  recipient: varchar('recipient', { length: 20 }).notNull(),
  message: text('message').notNull(),
  pages: integer('pages').default(1).notNull(),
  cost: decimal('cost', { precision: 18, scale: 6 }).notNull(),
  status: smsStatusEnum('status').default('PENDING').notNull(),
  provider: smsProviderEnum('provider').default('WEB').notNull(),
  externalId: varchar('external_id', { length: 255 }),
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sms_logs_user_idx').on(table.userId),
  index('sms_logs_status_idx').on(table.status),
  index('sms_logs_recipient_idx').on(table.recipient),
  index('sms_logs_created_idx').on(table.createdAt),
]);

// Sender IDs Table
export const senderIds = pgTable('sender_ids', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  senderId: varchar('sender_id', { length: 11 }).notNull(),
  status: senderIdStatusEnum('status').default('PENDING').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  rejectionReason: text('rejection_reason'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sender_ids_user_idx').on(table.userId),
  index('sender_ids_status_idx').on(table.status),
  unique('sender_ids_user_sender_idx').on(table.userId, table.senderId),
]);

// API Keys Table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  type: apiKeyTypeEnum('type').default('LIVE').notNull(),
  lastUsedAt: timestamp('last_used_at'),
  ipWhitelist: jsonb('ip_whitelist').default([]).notNull(),
  rateLimit: integer('rate_limit').default(1000),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('api_keys_user_idx').on(table.userId),
]);

// Contacts Table
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  tags: jsonb('tags').default([]).notNull(),
  customFields: jsonb('custom_fields').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('contacts_user_idx').on(table.userId),
  index('contacts_phone_idx').on(table.phone),
]);

// Groups Table
export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  contactCount: integer('contact_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('groups_user_idx').on(table.userId),
]);

// Group Contacts Junction Table
export const groupContacts = pgTable('group_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => [
  unique('group_contacts_pk').on(table.groupId, table.contactId),
]);

// Payments Table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  gateway: paymentGatewayEnum('gateway').notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  reference: varchar('reference', { length: 255 }).notNull().unique(),
  gatewayReference: varchar('gateway_reference', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  index('payments_user_idx').on(table.userId),
  index('payments_status_idx').on(table.status),
  index('payments_reference_idx').on(table.reference),
]);

// SMS Providers Table
export const smsProviders = pgTable('sms_providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  apiBaseUrl: text('api_base_url').notNull(),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  senderIdRestrictions: jsonb('sender_id_restrictions').default({}).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(1),
  settings: jsonb('settings').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Settings Table (Singleton)
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  siteName: varchar('site_name', { length: 255 }).default('TextFlow Pro').notNull(),
  tagline: varchar('tagline', { length: 500 }),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#6366F1').notNull(),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#8B5CF6').notNull(),
  accentColor: varchar('accent_color', { length: 7 }).default('#06B6D4').notNull(),
  whatsappSupport: varchar('whatsapp_support', { length: 20 }),
  socialLinks: jsonb('social_links').default({}).notNull(),
  footerContent: text('footer_content'),
  copyright: varchar('copyright', { length: 255 }),
  termsUrl: text('terms_url'),
  privacyUrl: text('privacy_url'),
  activePaymentGateway: paymentGatewayEnum('active_payment_gateway').default('KORA').notNull(),
  koraSecretKey: text('kora_secret_key'),
  koraPublicKey: text('kora_public_key'),
  koraWebhookSecret: text('kora_webhook_secret'),
  paystackSecretKey: text('paystack_secret_key'),
  paystackPublicKey: text('paystack_public_key'),
  paystackWebhookSecret: text('paystack_webhook_secret'),
  pricingTiers: jsonb('pricing_tiers').default({
    USER: 0.020,
    AGENT: 0.015,
    DEVELOPER: 0.012,
  }).notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Scheduled SMS Table
export const scheduledSms = pgTable('scheduled_sms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  senderId: varchar('sender_id', { length: 11 }).notNull(),
  recipients: jsonb('recipients').default([]).notNull(),
  message: text('message').notNull(),
  pages: integer('pages').default(1).notNull(),
  totalCost: decimal('total_cost', { precision: 18, scale: 6 }).notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status: varchar('status', { length: 50 }).default('SCHEDULED').notNull(),
  jobId: varchar('job_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('scheduled_sms_user_idx').on(table.userId),
  index('scheduled_sms_status_idx').on(table.status),
  index('scheduled_sms_scheduled_idx').on(table.scheduledFor),
]);

// Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }).notNull().unique(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 50 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sessions_user_idx').on(table.userId),
  index('sessions_refresh_idx').on(table.refreshToken),
]);

// Webhooks Table
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  events: jsonb('events').default([]).notNull(),
  secret: varchar('secret', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('webhooks_user_idx').on(table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  smsLogs: many(smsLogs),
  senderIds: many(senderIds),
  apiKeys: many(apiKeys),
  contacts: many(contacts),
  groups: many(groups),
  payments: many(payments),
  sessions: many(sessions),
  webhooks: many(webhooks),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  admin: one(users, { fields: [transactions.adminId], references: [users.id] }),
}));

export const smsLogsRelations = relations(smsLogs, ({ one }) => ({
  user: one(users, { fields: [smsLogs.userId], references: [users.id] }),
}));

export const senderIdsRelations = relations(senderIds, ({ one }) => ({
  user: one(users, { fields: [senderIds.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  groupContacts: many(groupContacts),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  user: one(users, { fields: [groups.userId], references: [users.id] }),
  groupContacts: many(groupContacts),
}));

export const groupContactsRelations = relations(groupContacts, ({ one }) => ({
  group: one(groups, { fields: [groupContacts.groupId], references: [groups.id] }),
  contact: one(contacts, { fields: [groupContacts.contactId], references: [contacts.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
}));

export const scheduledSmsRelations = relations(scheduledSms, ({ one }) => ({
  user: one(users, { fields: [scheduledSms.userId], references: [users.id] }),
}));
