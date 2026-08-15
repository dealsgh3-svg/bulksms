'use client';

// Shared client-side parsers for CSV and VCF (vCard) contact files.
// Used by both the Contacts page (import) and the Send SMS pages (quick upload).

export interface ParsedContact {
  name?: string;
  phone: string;
  email?: string;
}

export interface ParsedFileResult {
  contacts: ParsedContact[];
  headers?: string[];
  rows?: string[][];
}

function cleanPhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

/**
 * Parses a .vcf (vCard) file possibly containing multiple contacts.
 * Extracts FN (full name) and the first TEL and EMAIL fields per card.
 */
export function parseVCF(text: string): ParsedContact[] {
  const cards = text.split(/BEGIN:VCARD/i).slice(1);
  const contacts: ParsedContact[] = [];

  for (const card of cards) {
    const lines = card.split(/\r\n|\r|\n/);
    let name: string | undefined;
    let phone: string | undefined;
    let email: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || /^END:VCARD/i.test(trimmed)) continue;

      const separatorIndex = trimmed.indexOf(':');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).toUpperCase();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!name && key.startsWith('FN')) {
        name = value;
      } else if (!name && key.startsWith('N') && !key.startsWith('NOTE')) {
        // Fallback to structured N field (Last;First;...) if FN missing.
        const parts = value.split(';').filter(Boolean);
        if (parts.length) name = parts.reverse().join(' ');
      } else if (!phone && key.startsWith('TEL')) {
        phone = cleanPhone(value);
      } else if (!email && key.startsWith('EMAIL')) {
        email = value;
      }
    }

    if (phone) {
      contacts.push({ name, phone, email });
    }
  }

  return contacts;
}

/**
 * Parses a simple CSV file and attempts to auto-detect phone/name/email
 * columns. Returns both the raw headers/rows (for manual column mapping UIs)
 * and a best-effort contacts array.
 */
export function parseCSVFile(text: string): ParsedFileResult {
  const lines = text.trim().split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { contacts: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map((row) => row.split(',').map((cell) => cell.trim().replace(/"/g, '')));

  const phoneIdx = headers.findIndex((h) => /phone|mobile|tel|cell|number/i.test(h));
  const nameIdx = headers.findIndex((h) => /name/i.test(h));
  const emailIdx = headers.findIndex((h) => /email/i.test(h));

  const resolvedPhoneIdx = phoneIdx >= 0 ? phoneIdx : 0;

  const contacts: ParsedContact[] = rows
    .map((row) => ({
      phone: cleanPhone(row[resolvedPhoneIdx] || ''),
      name: nameIdx >= 0 ? row[nameIdx] : undefined,
      email: emailIdx >= 0 ? row[emailIdx] : undefined,
    }))
    .filter((c) => c.phone.length > 0);

  return { contacts, headers, rows };
}

/**
 * Detects file type by extension and parses accordingly. Returns null for
 * unsupported file types.
 */
export async function parseContactFile(file: File): Promise<ParsedFileResult | null> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const text = await file.text();

  if (ext === 'vcf') {
    return { contacts: parseVCF(text) };
  }

  if (ext === 'csv') {
    return parseCSVFile(text);
  }

  return null;
}
