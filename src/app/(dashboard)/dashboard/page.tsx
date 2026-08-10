'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Send,
  Wallet,
  TrendingUp,
  Users,
  MessageSquare,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';

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

export default function DashboardPage() {
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

  const statusIcons: Record<string, React.ReactNode> = {
    DELIVERED: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    SENT: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
    FAILED: <XCircle className="h-4 w-4" style={{ color: '#CE1126' }} />,
  };

  const deliveryRate = stats.totalSms > 0
    ? (stats.delivered / stats.totalSms) * 100
    : 0;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your SMS activity overview.</p>
        </div>
        <Link
          href="/dashboard/sms"
          className="btn text-white"
          style={{ backgroundColor: '#006B3F' }}
        >
          <Send className="h-4 w-4" />
          Send SMS
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Send, label: 'Total SMS Sent', value: stats.totalSms, bg: '#006B3F20', color: '#006B3F' },
          { icon: CheckCircle2, label: 'Delivery Rate', value: deliveryRate, suffix: '%', decimals: 1, bg: '#006B3F20', color: '#006B3F' },
          { icon: null, label: 'Total Spent', value: stats.totalSpent, prefix: 'GH₵', decimals: 2, bg: '#FCD11630', color: '#000', isCedi: true },
          { icon: Users, label: 'Total Contacts', value: stats.contacts, bg: '#006B3F20', color: '#006B3F' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg" style={{ backgroundColor: card.bg }}>
                  {card.isCedi ? (
                    <span className="text-lg font-bold px-0.5" style={{ color: card.color }}>GH₵</span>
                  ) : Icon ? (
                    <Icon className="h-5 w-5" style={{ color: card.color }} />
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  <AnimatedCounter
                    value={card.value}
                    prefix={card.prefix || ''}
                    suffix={card.suffix || ''}
                    decimals={card.decimals || 0}
                  />
                </div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent SMS Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="font-semibold">Recent Messages</h3>
            <Link href="/dashboard/analytics" className="text-sm hover:underline" style={{ color: '#006B3F' }}>
              View all
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">No messages sent yet</p>
              <p className="text-xs text-muted-foreground">Your recent SMS activity will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {statusIcons[log.status] || statusIcons.PENDING}
                    <div>
                      <div className="font-medium text-sm">{log.recipient}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {log.message}
                      </div>
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/sms"
              className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
                <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">Send Quick SMS</div>
                <div className="text-sm text-muted-foreground">Send a single message</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/sms/bulk"
              className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
                <MessageSquare className="h-5 w-5" style={{ color: '#000' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">Bulk SMS</div>
                <div className="text-sm text-muted-foreground">Upload CSV for mass sending</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/contacts"
              className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
                <Users className="h-5 w-5" style={{ color: '#006B3F' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">Import Contacts</div>
                <div className="text-sm text-muted-foreground">Add new contacts to your list</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/wallet"
              className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
                <Wallet className="h-5 w-5" style={{ color: '#000' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">Top Up Wallet</div>
                <div className="text-sm text-muted-foreground">Add more SMS credits</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
