'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, Users, CheckCircle2, Inbox } from 'lucide-react';

interface AdminStats {
  totalRevenue: number;
  smsDelivered: number;
  smsFailed: number;
  smsPending: number;
  totalSms: number;
  totalUsers: number;
  activeUsers: number;
  agentUsers: number;
  developerUsers: number;
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0, smsDelivered: 0, smsFailed: 0, smsPending: 0,
    totalSms: 0, totalUsers: 0, activeUsers: 0, agentUsers: 0, developerUsers: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => { if (data.success) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const deliveryRate = stats.totalSms > 0 ? ((stats.smsDelivered / stats.totalSms) * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl border bg-card skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#FCD11630' }}>
            <span className="text-lg font-bold" style={{ color: '#000' }}>GH₵</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">GH₵{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalSms.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Sent</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <Users className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{deliveryRate}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>
      </div>

      {stats.totalSms === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No SMS activity yet</p>
          <p className="text-sm text-muted-foreground">Charts and detailed analytics will appear once messages start flowing</p>
        </motion.div>
      )}
    </div>
  );
}
