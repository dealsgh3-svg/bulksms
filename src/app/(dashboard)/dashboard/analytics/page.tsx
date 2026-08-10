'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, XCircle, Clock, Download, Inbox } from 'lucide-react';

interface DashboardStats {
  totalSms: number;
  delivered: number;
  failed: number;
  pending: number;
  totalSpent: number;
  contacts: number;
}

interface RecentLog {
  id: string;
  recipient: string;
  message: string;
  status: string;
  cost: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSms: 0, delivered: 0, failed: 0, pending: 0, totalSpent: 0, contacts: 0,
  });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentLogs(data.recentLogs || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const deliveryRate = stats.totalSms > 0
    ? ((stats.delivered / stats.totalSms) * 100).toFixed(1)
    : '0.0';

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statusIcons: Record<string, React.ReactNode> = {
    DELIVERED: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    SENT: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
    FAILED: <XCircle className="h-4 w-4" style={{ color: '#CE1126' }} />,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border bg-card skeleton" />
          ))}
        </div>
        <div className="h-64 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your SMS performance and costs</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalSms.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Sent</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#006B3F20' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{deliveryRate}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#CE112620' }}>
            <XCircle className="h-5 w-5" style={{ color: '#CE1126' }} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card p-6">
          <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: '#FCD11630' }}>
            <span className="text-lg font-bold" style={{ color: '#000' }}>GH₵</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">GH₵{stats.totalSpent.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </motion.div>
      </div>

      {/* Recent Logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold">Message Log</h3>
        </div>
        {recentLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No messages sent yet</p>
            <p className="text-xs text-muted-foreground">Send your first SMS to see delivery analytics here</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {statusIcons[log.status] || statusIcons.PENDING}
                  <div>
                    <div className="font-medium text-sm">{log.recipient}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">{log.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">GH₵{parseFloat(log.cost).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
