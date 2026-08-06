'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Check, Palette, CreditCard, Globe, MessageSquare } from 'lucide-react';

interface Settings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  whatsappSupport: string;
  activePaymentGateway: 'MOMO' | 'BANK';
  pricingTiers: {
    USER: number;
    AGENT: number;
    DEVELOPER: number;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'TextFlow Pro',
    tagline: 'Bulk SMS for Ghanaian Businesses',
    logoUrl: '',
    primaryColor: '#006B3F',
    secondaryColor: '#FCD116',
    accentColor: '#CE1126',
    whatsappSupport: '+233241234567',
    activePaymentGateway: 'MOMO',
    pricingTiers: {
      USER: 0.05,
      AGENT: 0.04,
      DEVELOPER: 0.035,
    },
  });
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'pricing', label: 'Pricing', icon: Globe },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

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

      <div className="border-b">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
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
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">
                Configure payment options for wallet top-ups
              </p>

              <div className="space-y-3">
                {['MOMO', 'BANK'].map((gateway) => (
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
                      onChange={() => setSettings({ ...settings, activePaymentGateway: gateway as 'MOMO' | 'BANK' })}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      settings.activePaymentGateway === gateway
                        ? 'border-green-600'
                        : 'border-muted'
                    }`}>
                      {settings.activePaymentGateway === gateway && (
                        <div className="h-3 w-3 rounded-full bg-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {gateway === 'MOMO' ? 'Mobile Money (MTN/Telecel)' : 'Bank Transfer'}
                      </div>
                    </div>
                    {settings.activePaymentGateway === gateway && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </label>
                ))}
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
