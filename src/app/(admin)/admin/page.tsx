'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Send,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  TrendingUp,
  Inbox,
} from 'lucide-react';

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

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    smsDelivered: 0,
    smsFailed: 0,
    smsPending: 0,
    totalSms: 0,
    totalUsers: 0,
    activeUsers: 0,
    agentUsers: 0,
    developerUsers: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border bg-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const deliveryRate = stats.totalSms > 0
    ? ((stats.smsDelivered / stats.totalSms) * 100).toFixed(1)
    : '0.0';
  const regularUsers = stats.totalUsers - stats.agentUsers - stats.developerUsers;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform&apos;s performance</p>
      </div>

      {/* Revenue + User Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
              <span className="text-lg font-bold" style={{ color: '#000' }}>GH₵</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">GH₵{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Users className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalSms.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total SMS</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{deliveryRate}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>
      </div>

      {/* SMS Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.smsDelivered.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Delivered</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#CE112620' }}>
            <XCircle className="h-5 w-5" style={{ color: '#CE1126' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.smsFailed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Failed</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#FCD11630' }}>
            <Clock className="h-5 w-5" style={{ color: '#000' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.smsPending.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Pending</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <Wallet className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
        </motion.div>
      </div>

      {/* User Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="rounded-xl border bg-card p-6 max-w-xl">
        <h3 className="font-semibold mb-4">User Distribution</h3>
        {stats.totalUsers === 0 ? (
          <div className="text-center py-8">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No users registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Regular Users', count: regularUsers, color: '#006B3F' },
              { label: 'Agents', count: stats.agentUsers, color: '#FCD116' },
              { label: 'Developers', count: stats.developerUsers, color: '#CE1126' },
            ].map((role) => (
              <div key={role.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{role.label}</span>
                  <span className="text-sm font-medium">{role.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: role.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalUsers > 0 ? (role.count / stats.totalUsers) * 100 : 0}%` }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
