'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, AlertCircle, CheckCircle2, Loader2, User } from 'lucide-react';
import Link from 'next/link';

interface SmsState {
  recipient: string;
  message: string;
  senderId: string;
}

interface CostPreview {
  pages: number;
  charsPerPage: number;
  isUnicode: boolean;
  totalCost: number;
  rate: number;
}

export default function QuickSmsPage() {
  const [formData, setFormData] = useState<SmsState>({
    recipient: '',
    message: '',
    senderId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [balance, setBalance] = useState('0');
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch balance
    fetch('/api/wallet/balance')
      .then((res) => res.json())
      .then((data) => setBalance(data.balance || '0'))
      .catch(() => setBalance('0'));

    // Fetch recent contacts
    setRecentContacts([
      { phone: '+2348012345678', name: 'John Doe' },
      { phone: '+2348098765432', name: 'Jane Smith' },
      { phone: '+2347051234567', name: 'Bob Wilson' },
    ]);
  }, []);

  const calculateCost = (message: string, role: string = 'USER'): CostPreview => {
    const gsm7Chars = message.match(/^[A-Za-z0-9\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/);
    const isUnicode = !gsm7Chars && /[^\x00-\x7F]/.test(message);
    const charsPerPage = isUnicode ? 70 : 160;
    const pages = Math.ceil(message.length / charsPerPage) || 1;
    
    const rates: Record<string, number> = {
      USER: 0.02,
      AGENT: 0.015,
      DEVELOPER: 0.012,
      ADMIN: 0.01,
    };
    const rate = rates[role] || 0.02;
    const totalCost = pages * rate;

    return { pages, charsPerPage, isUnicode, totalCost, rate };
  };

  const costPreview = calculateCost(formData.message);
  const canSend = formData.recipient && formData.message && costPreview.totalCost <= parseFloat(balance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: formData.recipient,
          message: formData.message,
          senderId: formData.senderId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `Message sent successfully! ${data.deliveryCount || 1} recipient(s) reached.`,
        });
        setFormData({ recipient: '', message: '', senderId: '' });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to send message',
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Send SMS</h1>
        <p className="text-muted-foreground">Send a single message to one recipient</p>
      </div>

      {/* Result Alert */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-500/10 border-green-500/20 text-green-600'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{result.success ? result.message : result.error}</span>
          </div>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium mb-2">Recipient</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="+2348012345678"
                  className="input w-full pl-10"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +234 for Nigeria)
              </p>
            </div>

            {/* Sender ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sender ID <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.senderId}
                onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                placeholder="MyCompany"
                maxLength={11}
                className="input w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                3-11 alphanumeric characters. Leave blank to use default.
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message here..."
                rows={6}
                className="input w-full resize-none"
                required
              />
              
              {/* Character Counter */}
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className={formData.message.length > 160 ? 'text-yellow-600' : 'text-muted-foreground'}>
                    {formData.message.length} characters
                  </span>
                  {costPreview.isUnicode && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      Unicode detected
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {costPreview.pages} page{costPreview.pages !== 1 ? 's' : ''} ({costPreview.charsPerPage} chars/page)
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={!canSend || isLoading}
                className="btn btn-primary h-11 px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>

              {costPreview.totalCost > parseFloat(balance) && (
                <Link href="/dashboard/wallet" className="text-sm text-primary hover:underline">
                  Insufficient balance - Top up →
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Cost Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate per page</span>
                <span>${costPreview.rate.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages</span>
                <span>{costPreview.pages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipients</span>
                <span>1</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total Cost</span>
                <span className="text-primary">${costPreview.totalCost.toFixed(3)}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Contacts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Recent Contacts</h3>
            <div className="space-y-2">
              {recentContacts.map((contact) => (
                <button
                  key={contact.phone}
                  onClick={() => setFormData({ ...formData, recipient: contact.phone })}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">{contact.phone}</div>
                  </div>
                </button>
              ))}
            </div>
            <Link href="/dashboard/contacts" className="block mt-4 text-sm text-primary hover:underline">
              View all contacts →
            </Link>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-muted/50 p-6"
          >
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Keep messages under 160 chars for single SMS</li>
              <li>• Avoid special characters for better delivery</li>
              <li>• Include opt-out instructions for marketing</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
