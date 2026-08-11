'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2, ArrowRight, ArrowLeft, Users } from 'lucide-react';
import { useAuth, useSettings, useWallet } from '@/providers';
import { ContactPickerModal, PickerContact } from '@/components/contact-picker-modal';
import { parseContactFile } from '@/lib/contact-file-parser';

type Step = 'upload' | 'preview' | 'confirm';

interface Recipient {
  phone: string;
  name?: string;
  selected: boolean;
}

function normalizeGhanaPhone(input: string): string {
  const raw = input.trim();
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('233')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`;
  if (raw.startsWith('+233')) return raw;
  return cleaned ? `+233${cleaned}` : raw;
}

export default function BulkSmsPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { balance, refreshBalance } = useWallet();

  const [step, setStep] = useState<Step>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);

  useEffect(() => {
    if (recipients.length > 0 && step === 'upload') setStep('preview');
  }, [recipients, step]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'vcf'].includes(ext || '')) {
      setResult({ success: false, error: 'Please upload a CSV or VCF file' });
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const parsed = await parseContactFile(selectedFile);
    if (!parsed || parsed.contacts.length === 0) {
      setResult({ success: false, error: 'No valid contacts found in this file' });
      return;
    }

    const seen = new Set<string>();
    const processed: Recipient[] = [];
    for (const c of parsed.contacts) {
      const phone = normalizeGhanaPhone(c.phone);
      if (!/^\+\d{10,14}$/.test(phone) || seen.has(phone)) continue;
      seen.add(phone);
      processed.push({ phone, name: c.name, selected: true });
    }

    setRecipients(processed);
  };

  const handleContactsSelected = (contacts: PickerContact[]) => {
    setRecipients((prev) => {
      const existing = new Set(prev.map((r) => r.phone));
      const additions = contacts
        .filter((c) => !existing.has(c.phone))
        .map((c) => ({ phone: c.phone, name: c.name || undefined, selected: true }));
      return [...prev, ...additions];
    });
    setStep('preview');
  };

  const rate = useMemo(() => {
    const role = user?.role || 'USER';
    const tiers = settings?.pricingTiers;
    const fallback: Record<string, number> = { USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 };
    const configured = tiers?.[role];
    return typeof configured === 'number' && configured > 0 ? configured : fallback[role] || fallback.USER;
  }, [user?.role, settings?.pricingTiers]);

  const calculateCost = () => {
    const gsm7Chars = message.match(/^[A-Za-z0-9\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/);
    const isUnicode = !gsm7Chars && /[^\x00-\x7F]/.test(message);
    const charsPerPage = isUnicode ? 70 : 160;
    const pages = Math.ceil(message.length / charsPerPage) || 1;
    const selectedCount = recipients.filter((r) => r.selected).length;
    return { pages, charsPerPage, isUnicode, selectedCount, totalCost: pages * selectedCount * rate, rate };
  };

  const costPreview = calculateCost();
  const canSubmit = message.trim().length > 0 && costPreview.selectedCount > 0 && costPreview.totalCost <= parseFloat(balance);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/sms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.filter((r) => r.selected).map((r) => r.phone),
          message,
          senderId: senderId || undefined,
          scheduleAt: scheduleDate || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: scheduleDate
            ? `Scheduled ${data.count} messages for ${new Date(scheduleDate).toLocaleString('en-GH')}.`
            : `Successfully queued ${data.count} messages${data.upstreamMessageId ? ` (Agoo ID: ${data.upstreamMessageId})` : ''}.`,
        });
        setStep('upload');
        setFile(null);
        setRecipients([]);
        setMessage('');
        await refreshBalance();
      } else {
        setResult({ success: false, error: typeof data.error === 'string' ? data.error : 'Failed to send messages' });
      }
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecipient = (index: number) => {
    setRecipients((prev) => prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)));
  };

  const selectAll = () => setRecipients((prev) => prev.map((r) => ({ ...r, selected: true })));
  const deselectAll = () => setRecipients((prev) => prev.map((r) => ({ ...r, selected: false })));

  const steps: Step[] = ['upload', 'preview', 'confirm'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bulk SMS</h1>
        <p className="text-muted-foreground">Send messages to multiple recipients via file upload or your contacts</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${
                step === s ? '' : i < steps.indexOf(step) ? '' : 'bg-muted text-foreground'
              }`}
              style={step === s || i < steps.indexOf(step) ? { backgroundColor: '#006B3F' } : {}}
            >
              {i < steps.indexOf(step) ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium capitalize ${step === s ? '' : 'text-muted-foreground'}`}>{s}</span>
            {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}
          >
            <div className="flex items-center gap-3">
              {result.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="text-sm">{result.success ? result.message : result.error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
            >
              <input type="file" accept=".csv,.vcf" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-medium mb-2">Drop your file here or click to upload</div>
              <div className="text-sm text-muted-foreground">Supports CSV and VCF (vCard) files</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button onClick={() => setShowContactPicker(true)} className="btn btn-outline w-full sm:w-auto">
              <Users className="h-4 w-4" style={{ color: '#006B3F' }} />
              Choose from Contacts
            </button>

            {file && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {recipients.length} recipients detected
                  </div>
                </div>
                <button onClick={() => { setFile(null); setRecipients([]); }} className="p-2 hover:bg-accent rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{recipients.filter((r) => r.selected).length} of {recipients.length} selected</span>
                  <span className="text-muted-foreground">•</span>
                  <button onClick={selectAll} className="text-sm hover:underline" style={{ color: '#006B3F' }}>Select all</button>
                  <span className="text-muted-foreground">•</span>
                  <button onClick={deselectAll} className="text-sm hover:underline" style={{ color: '#006B3F' }}>Deselect all</button>
                </div>
                <button onClick={() => setShowContactPicker(true)} className="text-sm hover:underline flex items-center gap-1" style={{ color: '#006B3F' }}>
                  <Users className="h-3.5 w-3.5" /> Add more from contacts
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y">
                {recipients.map((r, i) => (
                  <div key={r.phone} className="flex items-center gap-3 p-3">
                    <input type="checkbox" checked={r.selected} onChange={() => toggleRecipient(i)} className="rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{r.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep('upload')} className="btn btn-outline">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep('confirm')} disabled={recipients.filter((r) => r.selected).length === 0} className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={480} className="input w-full resize-none" placeholder="Type your message..." required />
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>{message.length}/480 chars</span>
                  <span>{costPreview.pages} page(s)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sender ID (optional)</label>
                  <input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Leave blank for default" maxLength={11} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule (optional)</label>
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="input w-full" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/50 p-6">
              <h3 className="font-semibold mb-4">Cost Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Recipients</span><span>{costPreview.selectedCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pages per message</span><span>{costPreview.pages}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate per page</span><span>GH₵{costPreview.rate.toFixed(3)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Cost</span>
                  <span className="text-lg" style={{ color: '#006B3F' }}>GH₵{costPreview.totalCost.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep('preview')} className="btn btn-outline">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={handleSubmit} disabled={!canSubmit || isLoading} className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Sending...' : scheduleDate ? 'Schedule Messages' : 'Send Messages'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactPickerModal
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onConfirm={handleContactsSelected}
        alreadySelectedPhones={recipients.map((r) => r.phone)}
      />
    </div>
  );
}
