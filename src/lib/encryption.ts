import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derives a stable 32-byte key from the ENCRYPTION_KEY env var (or a dev
 * fallback). Using a SHA-256 hash means the operator can set any length
 * passphrase in the environment and we still get a valid AES-256 key.
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || 'dev-only-insecure-fallback-key-change-me';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string (e.g. a payment gateway secret key) for
 * storage at rest. Returns a single string containing iv, authTag, and
 * ciphertext separated by colons so it can be stored in a single TEXT column.
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string produced by encryptSecret(). Returns an empty string if
 * the input is empty, missing, or was stored in legacy plaintext (in which
 * case the raw value is returned so existing data still works).
 */
export function decryptSecret(ciphertext: string | null | undefined): string {
  if (!ciphertext) return '';

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // Not in our encrypted format (e.g. legacy plaintext) - return as-is.
    return ciphertext;
  }

  try {
    const [ivHex, authTagHex, dataHex] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    // If decryption fails, treat as unreadable/corrupted secret.
    return '';
  }
}

/**
 * Masks a secret so it can be safely displayed in the admin UI without
 * exposing the full value, e.g. "sk_live_••••••••3f9a".
 */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return '';
  if (value.length <= 8) return '•'.repeat(value.length);
  return `${value.slice(0, 4)}${'•'.repeat(Math.max(4, value.length - 8))}${value.slice(-4)}`;
}
