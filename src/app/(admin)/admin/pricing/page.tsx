'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';

type PricingTiers = {
  USER: number;
  AGENT: number;
  DEVELOPER: number;
};

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<PricingTiers>({ USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load pricing');
      setPricing({
        USER: Number(data.settings.pricingTiers?.USER ?? 0.05),
        AGENT: Number(data.settings.pricingTiers?.AGENT ?? 0.04),
        DEVELOPER: Number(data.settings.pricingTiers?.DEVELOPER ?? 0.035),
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load pricing' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const savePricing = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        pricingTiers: pricing,
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save pricing');
      setMessage({ type: 'success', text: 'Pricing saved successfully.' });
      await fetchPricing();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save pricing' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTier = (tier: keyof PricingTiers, value: string) => {
    const parsed = Number(value);
    setPricing((current) => ({ ...current, [tier]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  if (isLoading) {
    return <div className="space-y-6"><div className="h-20 rounded-xl border bg-card skeleton" /><div className="h-96 rounded-xl border bg-card skeleton" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">Manage SMS pricing for different user tiers</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 max-w-2xl">
        <h3 className="font-semibold mb-6">Per-SMS Pricing (GH₵)</h3>

        <div className="space-y-6">
          {[
            { key: 'USER' as const, title: 'Regular Users', description: 'Standard pricing for individual users' },
            { key: 'AGENT' as const, title: 'Agents', description: 'Reduced rate for agent accounts', highlighted: true },
            { key: 'DEVELOPER' as const, title: 'Developers', description: 'API users with high-volume pricing' },
          ].map((tier) => (
            <div key={tier.key} className={`flex items-center justify-between p-4 rounded-lg border ${tier.highlighted ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10' : ''}`}>
              <div>
                <div className="font-medium">{tier.title}</div>
                <div className="text-sm text-muted-foreground">{tier.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">GH₵</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={pricing[tier.key]}
                  onChange={(e) => updateTier(tier.key, e.target.value)}
                  className="input w-28 text-right"
                />
                <span className="text-muted-foreground">/SMS</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={savePricing} disabled={isSaving} className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
