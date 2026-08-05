import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function generateReference(): string {
  return `TXN-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object, secret: string, expiresIn: string | number): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken<T>(token: string, secret: string): T | null {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `sk_live_${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`;
  const prefix = key.slice(0, 12);
  return { key, prefix, hash: key };
}

export function maskApiKey(key: string): string {
  return `${key.slice(0, 12)}${'•'.repeat(32)}${key.slice(-4)}`;
}

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
  if (!cleaned.startsWith('+')) return `+${cleaned}`;
  return cleaned;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function calculateSmsPages(message: string): { pages: number; charsPerPage: number; isUnicode: boolean } {
  const gsm7Chars = message.match(/^[A-Za-z0-9\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/);
  const isUnicode = !gsm7Chars;
  const charsPerPage = isUnicode ? 70 : 160;
  const pages = Math.ceil(message.length / charsPerPage);
  return { pages, charsPerPage, isUnicode };
}

export function calculateSmsCost(pages: number, rate: number): number {
  return Math.round(pages * rate * 1000000) / 1000000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(row =>
    row.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );
  return { headers, rows };
}
