export type UserRole = 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionReason = 'DEPOSIT' | 'SMS_PURCHASE' | 'REFUND' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type SmsStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REJECTED';
export type SmsProvider = 'WEB' | 'API' | 'BULK';
export type SenderIdStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApiKeyType = 'LIVE' | 'TEST';
export type PaymentGateway = 'KORA' | 'PAYSTACK';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  whatsappNumber: string;
  role: UserRole;
  emailVerified: boolean;
  whatsappVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  balanceAfter: string;
  reason: TransactionReason;
  description?: string;
  reference: string;
  adminId?: string;
  createdAt: Date;
}

export interface SmsLog {
  id: string;
  userId: string;
  senderId: string;
  recipient: string;
  message: string;
  pages: number;
  cost: string;
  status: SmsStatus;
  provider: SmsProvider;
  externalId?: string;
  errorCode?: string;
  errorMessage?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  phone: string;
  name?: string;
  email?: string;
  tags: string[];
  customFields: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  userId: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  type: ApiKeyType;
  lastUsedAt?: Date;
  ipWhitelist: string[];
  rateLimit: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  gateway: PaymentGateway;
  amount: string;
  currency: string;
  status: PaymentStatus;
  reference: string;
  gatewayReference?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Settings {
  id: number;
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  whatsappSupport?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  footerContent?: string;
  copyright?: string;
  termsUrl?: string;
  privacyUrl?: string;
  activePaymentGateway: PaymentGateway;
  pricingTiers: {
    USER: number;
    AGENT: number;
    DEVELOPER: number;
    [key: string]: number;
  };
}

export interface SmsPricing {
  user: number;
  agent: number;
  developer: number;
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSmsDelivered: number;
  totalSmsFailed: number;
  activeUsers: number;
  activeAgents: number;
  activeDevelopers: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
