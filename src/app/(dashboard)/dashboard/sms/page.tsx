'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, AlertCircle, CheckCircle2, Loader2, Users, Upload, X, Plus, Info,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth, useSettings, useWallet } from '@/providers';
import { ContactPickerModal, PickerContact } from '@/components/contact-picker-modal';
import { parseContactFile } from '@/lib/contact-file-parser';

interface Recipient {
  phone: string;
  name?: string;
}

interface SenderIdOption {
  id: string;
  senderId: string;
  status: string;
  isDefault: boolean;
}

function normalizeGhanaPhone(input: string): string {
  const raw = input.trim();
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('233')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`;
  if (raw.startsWith('+233')) return raw;
  return cleaned ? `+233${cleaned}` : raw;
}

function isLikelyValidPhone(phone: string): boolean {
  return /^\+\d{10,14}$/.test(phone);
}

export default function SendSmsPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { balance, refreshBalance } = useWallet();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('');
  const [senderOptions, setSenderOptions] = useState<SenderIdOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; details?: string } | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [recentContacts, setRecentContacts] = useState<PickerContact[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    fetch('/api/sender-ids')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSenderOptions(data.senderIds);
      })
      .catch(() => {});

    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecentContacts((data.contacts || []).slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const calculateMessageStats = (msg: string) => {
    const gsm7Chars = msg.match(/^[A-Za-z0-9\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/);
    const isUnicode = !gsm7Chars && /[^\x00-\x7F]/.test(msg);
    const charsPerPage = isUnicode ? 70 : 160;
    const pages = Math.ceil(msg.length / charsPerPage) || 1;
    return { pages, charsPerPage, isUnicode };
  };

  const rate = useMemo(() => {
    const role = user?.role || 'USER';
    const tiers = settings?.pricingTiers;
    const fallback: Record<string, number> = { USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 };
    const configured = tiers?.[role];
    return typeof configured === 'number' && configured > 0 ? configured : fallback[role] || fallback.USER;
  }, [user?.role, settings?.pricingTiers]);

  const { pages, charsPerPage, isUnicode } = calculateMessageStats(message);
  const totalCost = pages * rate * Math.max(recipients.length, 1);
  const canSend = recipients.length > 0 && message.trim().length > 0 && totalCost <= parseFloat(balance) && message.length <= 480;

  const addRecipientsFromText = (text: string) => {
    const parts = text.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;

    setRecipients((prev) => {
      const existingPhones = new Set(prev.map((r) => r.phone));
      const additions: Recipient[] = [];
      for (const part of parts) {
        const phone = normalizeGhanaPhone(part);
        if (!isLikelyValidPhone(phone) || existingPhones.has(phone)) continue;
        existingPhones.add(phone);
        additions.push({ phone });
      }
      return [...prev, ...additions];
    });
    setRecipientInput('');
  };

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipientsFromText(recipientInput);
    }
  };

  const removeRecipient = (phone: string) => {
    setRecipients((prev) => prev.filter((r) => r.phone !== phone));
  };

  const handleContactsSelected = (contacts: PickerContact[]) => {
    setRecipients((prev) => {
      const existingPhones = new Set(prev.map((r) => r.phone));
      const additions = contacts
        .filter((c) => !existingPhones.has(c.phone))
        .map((c) => ({ phone: c.phone, name: c.name || undefined }));
      return [...prev, ...additions];
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingFile(true);
    setResult(null);

    try {
      const parsed = await parseContactFile(file);
      if (!parsed || parsed.contacts.length === 0) {
        setResult({ success: false, error: 'No valid phone numbers found in the file. Supported formats: .csv, .vcf' });
        return;
      }

      setRecipients((prev) => {
        const existingPhones = new Set(prev.map((r) => r.phone));
        const additions: Recipient[] = [];
        for (const c of parsed.contacts) {
          const phone = normalizeGhanaPhone(c.phone);
          if (!isLikelyValidPhone(phone) || existingPhones.has(phone)) continue;
          existingPhones.add(phone);
          additions.push({ phone, name: c.name });
        }
        return [...prev, ...additions];
      });
    } catch {
      setResult({ success: false, error: 'Failed to read the selected file.' });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    setIsLoading(true);
    setResult(null);

    try {
      const isSingle = recipients.length === 1;
      const endpoint = isSingle ? '/api/sms/send' : '/api/sms/bulk';
      const body = isSingle
        ? { recipient: recipients[0].phone, message, senderId: senderId || undefined }
        : { recipients: recipients.map((r) => r.phone), message, senderId: senderId || undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const upstreamNote = data.upstreamMessageId
          ? ` Agoo message ID: ${data.upstreamMessageId} (status: ${data.status || 'SENDING'}).`
          : '';
        setResult({
          success: true,
          message: isSingle
            ? `Message sent to ${recipients[0].phone}.${upstreamNote}`
            : `Queued ${data.count || recipients.length} messages.${upstreamNote}`,
        });
        setRecipients([]);
        setMessage('');
        await refreshBalance();
      } else {
        setResult({
          success: false,
          error: typeof data.error === 'string' ? data.error : 'Failed to send message',
        });
      }
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Send SMS</h1>
        <p className="text-muted-foreground">Send to one or many recipients — pick from contacts, type numbers, or upload a file</p>
      </div>

      {/* Result Alert */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border ${
              result.success
                ? 'bg-green-500/10 border-green-500/20 text-green-700'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span className="text-sm">{result.success ? result.message : result.error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipients {recipients.length > 0 && <span className="text-muted-foreground font-normal">({recipients.length})</span>}
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientKeyDown}
                  placeholder="+233241234567 — press Enter or comma to add, paste multiple at once"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => addRecipientsFromText(recipientInput)}
                  disabled={!recipientInput.trim()}
                  className="btn btn-outline px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowContactPicker(true)}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Users className="h-4 w-4" style={{ color: '#006B3F' }} />
                  Choose from Contacts
                </button>
                <input ref={fileInputRef} type="file" accept=".csv,.vcf" className="hidden" onChange={handleFileUpload} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors"
                >
                  {isUploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" style={{ color: '#006B3F' }} />}
                  Upload CSV / VCF
                </button>
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30 max-h-40 overflow-y-auto">
                  {recipients.map((r) => (
                    <span
                      key={r.phone}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-card border"
                    >
                      {r.name ? `${r.name} (${r.phone})` : r.phone}
                      <button type="button" onClick={() => removeRecipient(r.phone)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Ghana format accepted: +233XXXXXXXXX or 0XXXXXXXXX. Adding more than one recipient automatically sends as bulk SMS.
              </p>
            </div>

            {/* Sender ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sender ID <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              {senderOptions.filter((s) => s.status === 'APPROVED').length > 0 ? (
                <select value={senderId} onChange={(e) => setSenderId(e.target.value)} className="input w-full">
                  <option value="">Use default (platform test sender)</option>
                  {senderOptions
                    .filter((s) => s.status === 'APPROVED')
                    .map((s) => (
                      <option key={s.id} value={s.senderId}>{s.senderId}{s.isDefault ? ' (default)' : ''}</option>
                    ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="Leave blank to use the platform default test sender"
                    maxLength={11}
                    className="input w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    You have no approved Sender IDs yet.{' '}
                    <Link href="/dashboard/sender-ids" className="hover:underline" style={{ color: '#006B3F' }}>Request one here</Link>.
                  </p>
                </>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                maxLength={480}
                className="input w-full resize-none"
                required
              />

              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className={message.length > 160 ? 'text-yellow-600' : 'text-muted-foreground'}>
                    {message.length}/480 characters
                  </span>
                  {isUnicode && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Unicode detected</span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {pages} page{pages !== 1 ? 's' : ''} ({charsPerPage} chars/page)
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={!canSend || isLoading}
                className="btn h-11 px-8 text-white"
                style={{ backgroundColor: '#006B3F' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {recipients.length > 1 ? `Send to ${recipients.length} Recipients` : 'Send Message'}
                  </>
                )}
              </button>

              {totalCost > parseFloat(balance) && recipients.length > 0 && (
                <Link href="/dashboard/wallet" className="text-sm hover:underline" style={{ color: '#006B3F' }}>
                  Insufficient balance - Top up →
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Cost Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate per page</span>
                <span>GH₵{rate.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages</span>
                <span>{pages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipients</span>
                <span>{recipients.length}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total Cost</span>
                <span style={{ color: '#006B3F' }}>GH₵{totalCost.toFixed(3)}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Contacts */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Contacts</h3>
            {recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactsSelected([contact])}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: '#FCD11630', color: '#000' }}>
                      {(contact.name || contact.phone).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{contact.name || 'Unnamed'}</div>
                      <div className="text-xs text-muted-foreground">{contact.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Link href="/dashboard/contacts" className="block mt-4 text-sm hover:underline" style={{ color: '#006B3F' }}>
              View all contacts →
            </Link>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border p-6"
            style={{ backgroundColor: '#FCD11615', borderColor: '#FCD11640' }}
          >
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Keep messages under 160 chars for a single SMS page</li>
              <li>• Adding 2+ recipients automatically sends as bulk</li>
              <li>• Test keys simulate delivery at no cost</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <ContactPickerModal
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onConfirm={handleContactsSelected}
        alreadySelectedPhones={recipients.map((r) => r.phone)}
      />
    </div>
  );
}
