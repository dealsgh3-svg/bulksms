'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

type AgooProvider = {
  apiBaseUrl: string;
  apiKeyMasked: string;
  apiKeySet: boolean;
  keyType: 'test' | 'live' | 'unknown';
  isActive: boolean;
  settings: Record<string, unknown>;
};

export default function AdminProvidersPage() {
  const [provider, setProvider] = useState<AgooProvider | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [balance, setBalance] = useState<{ balance?: number; currency?: string } | null>(null);

  const fetchProvider = async () => {
    try {
      const res = await fetch('/api/admin/providers/agoo');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load provider');
      setProvider(data.provider);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load provider' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, []);

  const saveProvider = async () => {
    if (!provider) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/providers/agoo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyDraft || undefined,
          isActive: provider.isActive,
          apiBaseUrl: provider.apiBaseUrl,
          testSenderId: String(provider.settings?.testSenderId || 'SMS_GATEWAY_USER_SENDER_ID'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save provider');

      setProvider(data.provider);
      setApiKeyDraft('');
      setMessage({ type: 'success', text: 'Agoo SMS provider configuration saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save provider' });
    } finally {
      setIsSaving(false);
    }
  };

  const checkBalance = async () => {
    setIsCheckingBalance(true);
    setMessage(null);
    setBalance(null);

    try {
      const res = await fetch('/api/admin/providers/agoo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch balance');
      setBalance(data.balance);
      setMessage({ type: 'success', text: 'Agoo connection successful.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to fetch balance' });
    } finally {
      setIsCheckingBalance(false);
    }
  };

  if (isLoading || !provider) {
    return <div className="space-y-6"><div className="h-20 rounded-xl border bg-card skeleton" /><div className="h-96 rounded-xl border bg-card skeleton" /></div>;
  }

  const draftKeyType = apiKeyDraft.startsWith('agoo_test_') ? 'test' : apiKeyDraft.startsWith('agoo_live_') ? 'live' : apiKeyDraft ? 'unknown' : provider.keyType;
  const testSenderId = String(provider.settings?.testSenderId || 'SMS_GATEWAY_USER_SENDER_ID');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS Providers</h1>
        <p className="text-muted-foreground">Configure the Agoo SMS upstream engine for Ghana delivery.</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 max-w-3xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Agoo SMS</h3>
            <p className="text-sm text-muted-foreground">Primary SMS gateway for Ghana (MTN, Telecel, AT). Base URL: https://api.agoosms.com</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${provider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{provider.isActive ? 'Active' : 'Disabled'}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${provider.apiKeySet ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{provider.apiKeySet ? `Key set (${provider.keyType})` : 'No API key saved'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyDraft}
                onChange={(e) => setApiKeyDraft(e.target.value.trim())}
                placeholder={provider.apiKeySet ? `Saved: ${provider.apiKeyMasked} — enter a new key to replace it` : 'agoo_test_... or agoo_live_...'}
                className="input w-full pr-10 font-mono"
              />
              <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use <code>agoo_test_</code> for sandbox delivery and <code>agoo_live_</code> for production delivery. The key is sent as <code>X-API-Key</code> on all upstream requests.
            </p>
            {draftKeyType === 'unknown' && <p className="text-xs text-destructive mt-1">Agoo keys must start with agoo_test_ or agoo_live_.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Base URL</label>
            <input value={provider.apiBaseUrl} onChange={(e) => setProvider({ ...provider, apiBaseUrl: e.target.value })} className="input w-full font-mono" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platform Test Sender ID</label>
            <input value={testSenderId} onChange={(e) => setProvider({ ...provider, settings: { ...provider.settings, testSenderId: e.target.value } })} className="input w-full font-mono" />
            <p className="text-xs text-muted-foreground mt-1">For Agoo test keys, pass this sender ID and the exact message <code>Hello from Agoo</code> for sandbox testing.</p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
            <div className="font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: '#006B3F' }} /> Agoo API Engine Rules</div>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Single SMS: <code>POST /v1/sms/send</code> with <code>to</code>, <code>message</code>, and <code>senderId</code>.</li>
              <li>Bulk SMS: <code>POST /v1/sms/send-bulk</code> with up to 1,000 recipients.</li>
              <li>Maximum message length: 480 characters / 3 segments.</li>
              <li>Status and cost are returned synchronously by Agoo; no webhooks are required.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Provider Status</div>
              <div className="text-sm text-muted-foreground">Enable or disable all upstream Agoo sends</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={provider.isActive} onChange={(e) => setProvider({ ...provider, isActive: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {balance && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: '#006B3F10', borderColor: '#006B3F30' }}>
              <div className="text-sm text-muted-foreground">Agoo Balance</div>
              <div className="text-2xl font-bold">GH₵{Number(balance.balance || 0).toFixed(3)}</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button onClick={checkBalance} disabled={isCheckingBalance || !provider.apiKeySet} className="btn btn-outline">
            {isCheckingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Check Balance
          </button>
          <button onClick={saveProvider} disabled={isSaving || draftKeyType === 'unknown'} className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
}
