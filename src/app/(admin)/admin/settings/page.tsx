'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Loader2, Check, Palette, CreditCard, Globe, MessageSquare,
  Eye, EyeOff, ShieldCheck, AlertCircle, ExternalLink,
} from 'lucide-react';

interface SettingsState {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  whatsappSupport: string;
  activePaymentGateway: 'KORA' | 'PAYSTACK';
  pricingTiers: {
    USER: number;
    AGENT: number;
    DEVELOPER: number;
  };
  koraPublicKey: string;
  koraSecretKeyMasked: string;
  koraSecretKeySet: boolean;
  koraWebhookSecretMasked: string;
  koraWebhookSecretSet: boolean;
  paystackPublicKey: string;
  paystackSecretKeyMasked: string;
  paystackSecretKeySet: boolean;
  paystackWebhookSecretMasked: string;
  paystackWebhookSecretSet: boolean;
}

const defaultSettings: SettingsState = {
  siteName: 'TextFlow Pro',
  tagline: 'Bulk SMS for Ghanaian Businesses',
  logoUrl: '',
  primaryColor: '#006B3F',
  secondaryColor: '#FCD116',
  accentColor: '#CE1126',
  whatsappSupport: '+233241234567',
  activePaymentGateway: 'KORA',
  pricingTiers: { USER: 0.05, AGENT: 0.04, DEVELOPER: 0.035 },
  koraPublicKey: '',
  koraSecretKeyMasked: '',
  koraSecretKeySet: false,
  koraWebhookSecretMasked: '',
  koraWebhookSecretSet: false,
  paystackPublicKey: '',
  paystackSecretKeyMasked: '',
  paystackSecretKeySet: false,
  paystackWebhookSecretMasked: '',
  paystackWebhookSecretSet: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  // Draft values for secret inputs - kept separate so we only send them to
  // the API when the admin actually types a new value.
  const [secrets, setSecrets] = useState({
    koraSecretKey: '',
    koraWebhookSecret: '',
    paystackSecretKey: '',
    paystackWebhookSecret: '',
  });
  const [showSecrets, setShowSecrets] = useState({
    koraSecretKey: false,
    koraWebhookSecret: false,
    paystackSecretKey: false,
    paystackWebhookSecret: false,
  });
  const [activeTab, setActiveTab] = useState('branding');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch {
      setSaveError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const payload: Record<string, unknown> = {
        siteName: settings.siteName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        whatsappSupport: settings.whatsappSupport,
        activePaymentGateway: settings.activePaymentGateway,
        pricingTiers: settings.pricingTiers,
        koraPublicKey: settings.koraPublicKey,
        paystackPublicKey: settings.paystackPublicKey,
      };

      // Only send secret fields the admin actually typed something into.
      if (secrets.koraSecretKey) payload.koraSecretKey = secrets.koraSecretKey;
      if (secrets.koraWebhookSecret) payload.koraWebhookSecret = secrets.koraWebhookSecret;
      if (secrets.paystackSecretKey) payload.paystackSecretKey = secrets.paystackSecretKey;
      if (secrets.paystackWebhookSecret) payload.paystackWebhookSecret = secrets.paystackWebhookSecret;

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(true);
        setSecrets({ koraSecretKey: '', koraWebhookSecret: '', paystackSecretKey: '', paystackWebhookSecret: '' });
        await fetchSettings();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save settings');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'pricing', label: 'Pricing', icon: Globe },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-16 rounded-xl border bg-card skeleton" />
        <div className="h-96 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn text-white"
          style={{ backgroundColor: '#006B3F' }}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          {saveError}
        </motion.div>
      )}

      <div className="border-b">
        <nav className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Site Identity</h3>

              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Brand Colors (Ghana Theme)</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary (Green)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="h-10 w-16 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Secondary (Gold)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="h-10 w-16 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Accent (Red)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="h-10 w-16 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Preview</div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="h-10 w-24 rounded-lg flex items-center justify-center text-black text-sm font-medium"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div
                    className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Accent
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Active Gateway Selector */}
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <div>
                <h3 className="font-semibold">Active Payment Gateway</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose which gateway processes wallet top-ups. Only the selected gateway will be
                  offered to users on the Wallet page.
                </p>
              </div>

              <div className="space-y-3">
                {(['KORA', 'PAYSTACK'] as const).map((gateway) => {
                  const configured = gateway === 'KORA' ? settings.koraSecretKeySet : settings.paystackSecretKeySet;
                  return (
                    <label
                      key={gateway}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        settings.activePaymentGateway === gateway
                          ? 'border-green-600 bg-green-50'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={gateway}
                        checked={settings.activePaymentGateway === gateway}
                        onChange={() => setSettings({ ...settings, activePaymentGateway: gateway })}
                        className="sr-only"
                      />
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        settings.activePaymentGateway === gateway ? 'border-green-600' : 'border-muted'
                      }`}>
                        {settings.activePaymentGateway === gateway && (
                          <div className="h-3 w-3 rounded-full bg-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{gateway === 'KORA' ? 'Kora Pay' : 'Paystack'}</div>
                        <div className="text-xs text-muted-foreground">
                          {gateway === 'KORA' ? 'Default gateway • Mobile Money, Card, Bank Transfer' : 'Mobile Money, Card, Bank Transfer'}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                        configured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {configured ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {configured ? 'Configured' : 'Needs API keys'}
                      </span>
                    </label>
                  );
                })}
              </div>

              {!(settings.activePaymentGateway === 'KORA' ? settings.koraSecretKeySet : settings.paystackSecretKeySet) && (
                <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    The active gateway has no secret key configured yet. Deposits will fail until you add the API
                    keys below.
                  </span>
                </div>
              )}
            </div>

            {/* Kora Pay Keys */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Kora Pay API Keys</h3>
                <a
                  href="https://developers.korapay.com/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline"
                  style={{ color: '#006B3F' }}
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Public Key</label>
                <input
                  type="text"
                  value={settings.koraPublicKey}
                  onChange={(e) => setSettings({ ...settings, koraPublicKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="input w-full text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Secret Key {settings.koraSecretKeySet && <span className="text-green-600">(currently set: {settings.koraSecretKeyMasked})</span>}
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.koraSecretKey ? 'text' : 'password'}
                    value={secrets.koraSecretKey}
                    onChange={(e) => setSecrets({ ...secrets, koraSecretKey: e.target.value })}
                    placeholder={settings.koraSecretKeySet ? 'Enter a new key to replace the existing one' : 'sk_live_...'}
                    className="input w-full text-sm font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, koraSecretKey: !showSecrets.koraSecretKey })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSecrets.koraSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Webhook Signing Secret {settings.koraWebhookSecretSet && <span className="text-green-600">(currently set)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.koraWebhookSecret ? 'text' : 'password'}
                    value={secrets.koraWebhookSecret}
                    onChange={(e) => setSecrets({ ...secrets, koraWebhookSecret: e.target.value })}
                    placeholder={settings.koraWebhookSecretSet ? 'Enter a new secret to replace the existing one' : 'Optional - Kora uses your secret key by default'}
                    className="input w-full text-sm font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, koraWebhookSecret: !showSecrets.koraWebhookSecret })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSecrets.koraWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                Webhook URL to add in your Kora dashboard: <br />
                <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/kora</code>
              </div>
            </div>

            {/* Paystack Keys */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Paystack API Keys</h3>
                <a
                  href="https://paystack.com/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline"
                  style={{ color: '#006B3F' }}
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Public Key</label>
                <input
                  type="text"
                  value={settings.paystackPublicKey}
                  onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="input w-full text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Secret Key {settings.paystackSecretKeySet && <span className="text-green-600">(currently set: {settings.paystackSecretKeyMasked})</span>}
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.paystackSecretKey ? 'text' : 'password'}
                    value={secrets.paystackSecretKey}
                    onChange={(e) => setSecrets({ ...secrets, paystackSecretKey: e.target.value })}
                    placeholder={settings.paystackSecretKeySet ? 'Enter a new key to replace the existing one' : 'sk_live_...'}
                    className="input w-full text-sm font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, paystackSecretKey: !showSecrets.paystackSecretKey })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSecrets.paystackSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Webhook Signing Secret {settings.paystackWebhookSecretSet && <span className="text-green-600">(currently set)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.paystackWebhookSecret ? 'text' : 'password'}
                    value={secrets.paystackWebhookSecret}
                    onChange={(e) => setSecrets({ ...secrets, paystackWebhookSecret: e.target.value })}
                    placeholder={settings.paystackWebhookSecretSet ? 'Enter a new secret to replace the existing one' : 'Optional - Paystack uses your secret key by default'}
                    className="input w-full text-sm font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, paystackWebhookSecret: !showSecrets.paystackWebhookSecret })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSecrets.paystackWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                Webhook URL to add in your Paystack dashboard: <br />
                <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/paystack</code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <div>
                <h3 className="font-semibold">SMS Pricing by User Tier</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Set the cost per SMS for each user role. Prices are in Ghana Cedis (GH₵).
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Regular Users</div>
                    <div className="text-sm text-muted-foreground">Standard pricing for individual users</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">GH₵</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={settings.pricingTiers.USER}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricingTiers: { ...settings.pricingTiers, USER: parseFloat(e.target.value) || 0 }
                      })}
                      className="input w-24 text-right"
                    />
                    <span className="text-muted-foreground">/SMS</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      Agents
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Popular</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Reduced rate for agent accounts</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">GH₵</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={settings.pricingTiers.AGENT}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricingTiers: { ...settings.pricingTiers, AGENT: parseFloat(e.target.value) || 0 }
                      })}
                      className="input w-24 text-right"
                    />
                    <span className="text-muted-foreground">/SMS</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Developers</div>
                    <div className="text-sm text-muted-foreground">API users with high-volume pricing</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">GH₵</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={settings.pricingTiers.DEVELOPER}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricingTiers: { ...settings.pricingTiers, DEVELOPER: parseFloat(e.target.value) || 0 }
                      })}
                      className="input w-24 text-right"
                    />
                    <span className="text-muted-foreground">/SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Support Contact</h3>

              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp Support Number</label>
                <input
                  type="tel"
                  value={settings.whatsappSupport}
                  onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
                  placeholder="+233241234567"
                  className="input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This number will be displayed as a floating WhatsApp button on all pages.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
