'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState({
    USER: 0.05,
    AGENT: 0.04,
    DEVELOPER: 0.035,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">Manage SMS pricing for different user tiers</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 max-w-2xl">
        <h3 className="font-semibold mb-6">Per-SMS Pricing (GH₵)</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Regular Users</div>
              <div className="text-sm text-muted-foreground">Standard pricing for individual users</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">GH₵</span>
              <input
                type="number"
                step="0.001"
                value={pricing.USER}
                onChange={(e) => setPricing({ ...pricing, USER: parseFloat(e.target.value) })}
                className="input w-24 text-right"
              />
              <span className="text-muted-foreground">/SMS</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <div>
              <div className="font-medium">Agents</div>
              <div className="text-sm text-muted-foreground">Reduced rate for agent accounts</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">GH₵</span>
              <input
                type="number"
                step="0.001"
                value={pricing.AGENT}
                onChange={(e) => setPricing({ ...pricing, AGENT: parseFloat(e.target.value) })}
                className="input w-24 text-right"
              />
              <span className="text-muted-foreground">/SMS</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="font-medium">Developers</div>
              <div className="text-sm text-muted-foreground">API users with high-volume pricing</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">GH₵</span>
              <input
                type="number"
                step="0.001"
                value={pricing.DEVELOPER}
                onChange={(e) => setPricing({ ...pricing, DEVELOPER: parseFloat(e.target.value) })}
                className="input w-24 text-right"
              />
              <span className="text-muted-foreground">/SMS</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            className="btn text-white"
            style={{ backgroundColor: '#006B3F' }}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
