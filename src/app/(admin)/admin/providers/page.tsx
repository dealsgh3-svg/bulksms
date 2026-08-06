'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2 } from 'lucide-react';

export default function AdminProvidersPage() {
  const [agooConfig, setAgooConfig] = useState({
    apiKey: '',
    environment: 'test', // 'test' or 'live'
    isActive: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS Providers</h1>
        <p className="text-muted-foreground">Configure upstream SMS gateway settings</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div>
            <h3 className="font-semibold">Agoo SMS</h3>
            <p className="text-sm text-muted-foreground">Primary SMS gateway for Ghana (MTN, Telecel, AT)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={agooConfig.apiKey}
              onChange={(e) => setAgooConfig({ ...agooConfig, apiKey: e.target.value })}
              placeholder={agooConfig.environment === 'test' ? 'agoo_test_...' : 'agoo_live_...'}
              className="input w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use agoo_test_ prefix for testing (no real SMS sent), agoo_live_ for production
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Environment</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="test"
                  checked={agooConfig.environment === 'test'}
                  onChange={(e) => setAgooConfig({ ...agooConfig, environment: e.target.value })}
                  className="sr-only"
                />
                <div className={`px-4 py-2 rounded-lg border ${agooConfig.environment === 'test' ? 'border-green-600 bg-green-50' : 'border-input'}`}>
                  <div className="font-medium">Test Mode</div>
                  <div className="text-xs text-muted-foreground">No real SMS sent</div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  checked={agooConfig.environment === 'live'}
                  onChange={(e) => setAgooConfig({ ...agooConfig, environment: e.target.value })}
                  className="sr-only"
                />
                <div className={`px-4 py-2 rounded-lg border ${agooConfig.environment === 'live' ? 'border-green-600 bg-green-50' : 'border-input'}`}>
                  <div className="font-medium">Live Mode</div>
                  <div className="text-xs text-muted-foreground">Real SMS delivery</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Provider Status</div>
              <div className="text-sm text-muted-foreground">Enable or disable this provider</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agooConfig.isActive}
                onChange={(e) => setAgooConfig({ ...agooConfig, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            className="btn text-white"
            style={{ backgroundColor: '#006B3F' }}
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
}
