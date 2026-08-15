'use client';

import { useEffect, useState } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnimatedCounter } from '@/components/animated-counter';

const CHART_COLORS = ['#006B3F', '#FCD116', '#CE1126'];

type DashboardStats = {
  totalSms: number;
  delivered: number;
  failed: number;
  pending: number;
  totalSpent: number;
  contacts: number;
  groups: number;
};

type DashboardLog = {
  id: string;
  recipient: string;
  message: string;
  status: string;
  cost: string;
  createdAt: string;
};

type DashboardData = {
  stats: DashboardStats;
  chartData: { name: string; sms: number; api: number }[];
  deliveryData: { name: string; value: number }[];
  recentLogs: DashboardLog[];
};

const emptyStats: DashboardStats = {
  totalSms: 0,
  delivered: 0,
  failed: 0,
  pending: 0,
  totalSpent: 0,
  contacts: 0,
  groups: 0,
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [data, setData] = useState<DashboardData>({
    stats: emptyStats,
    chartData: [],
    deliveryData: [],
    recentLogs: [],
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/dashboard/summary')
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed to load dashboard');
        return payload as DashboardData & { success: true };
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { stats, chartData, deliveryData, recentLogs } = data;
  const deliveryRate = stats.totalSms > 0 ? (stats.delivered / stats.totalSms) * 100 : null;

  const statusIcons: Record<string, React.ReactNode> = {
    DELIVERED: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    SENT: <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} />,
    QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    FAILED: <XCircle className="h-4 w-4" style={{ color: '#CE1126' }} />,
    REJECTED: <XCircle className="h-4 w-4" style={{ color: '#CE1126' }} />,
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl border bg-card skeleton" />)}
        </div>
        <div className="h-96 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  const statCards = [
    { icon: Send, label: 'Total SMS Sent', value: stats.totalSms, bg: '#006B3F20', color: '#006B3F', trend: null },
    { icon: CheckCircle2, label: 'Delivery Rate', value: deliveryRate ?? 0, suffix: deliveryRate === null ? '' : '%', decimals: 1, bg: '#006B3F20', color: '#006B3F', trend: null },
    { icon: null, label: 'Total Spent', value: stats.totalSpent, prefix: 'GH₵', decimals: 2, bg: '#FCD11630', color: '#000', isCedi: true, trend: null },
    { icon: Users, label: 'Total Contacts', value: stats.contacts, bg: '#006B3F20', color: '#006B3F', trend: null },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your real-time SMS activity and wallet overview.</p>
        </div>
        <Link href="/dashboard/sms" className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
          <Send className="h-4 w-4" />
          Send SMS
        </Link>
      </div>

      {loadError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg" style={{ backgroundColor: card.bg }}>
                  {card.isCedi ? <span className="text-lg font-bold px-0.5" style={{ color: card.color }}>GH₵</span> : Icon ? <Icon className="h-5 w-5" style={{ color: card.color }} /> : null}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {deliveryRate === null && card.label === 'Delivery Rate' ? '—' : (
                    <AnimatedCounter value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} decimals={card.decimals || 0} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">SMS Volume</h3>
              <p className="text-xs text-muted-foreground">Last 7 days from your account</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#006B3F' }} />Web</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#FCD116' }} />API</div>
            </div>
          </div>
          {chartData.some((day) => day.sms || day.api) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="userSmsVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} /><stop offset="95%" stopColor="#006B3F" stopOpacity={0} /></linearGradient>
                    <linearGradient id="userApiVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FCD116" stopOpacity={0.3} /><stop offset="95%" stopColor="#FCD116" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="sms" name="Web" stroke="#006B3F" fill="url(#userSmsVolume)" />
                  <Area type="monotone" dataKey="api" name="API" stroke="#FCD116" fill="url(#userApiVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No SMS activity in the last 7 days.</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-6">Delivery Status</h3>
          {deliveryData.length > 0 ? (
            <>
              <div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deliveryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{deliveryData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              <div className="space-y-2 mt-4">{deliveryData.map((item, index) => <div key={item.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} /><span>{item.name}</span></div><span className="font-medium">{item.value.toLocaleString()}</span></div>)}</div>
            </>
          ) : <div className="h-52 flex items-center justify-center text-sm text-muted-foreground text-center">Send your first SMS to see delivery data.</div>}
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-6 border-b"><div><h3 className="font-semibold">Recent Messages</h3><p className="text-xs text-muted-foreground">Latest messages sent from your account</p></div><Link href="/dashboard/analytics" className="text-sm hover:underline" style={{ color: '#006B3F' }}>View all</Link></div>
          {recentLogs.length > 0 ? <div className="divide-y">{recentLogs.map((log) => <div key={log.id} className="flex items-center justify-between p-4"><div className="flex items-center gap-3">{statusIcons[log.status] || <Clock className="h-4 w-4 text-yellow-500" />}<div><div className="font-medium text-sm">{log.recipient}</div><div className="text-xs text-muted-foreground truncate max-w-[200px]">{log.message}</div></div></div><div className="text-right"><div className="text-sm font-medium">GH₵{parseFloat(log.cost).toFixed(3)}</div><div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString('en-GH')}</div></div></div>)}</div> : <div className="p-10 text-center text-sm text-muted-foreground">No messages have been sent yet.</div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/sms" className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"><div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}><Send className="h-5 w-5" style={{ color: '#006B3F' }} /></div><div className="flex-1"><div className="font-medium">Send Quick SMS</div><div className="text-sm text-muted-foreground">Send a single message</div></div><ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/dashboard/sms/bulk" className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"><div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}><MessageSquare className="h-5 w-5" style={{ color: '#000' }} /></div><div className="flex-1"><div className="font-medium">Bulk SMS</div><div className="text-sm text-muted-foreground">Upload CSV for mass sending</div></div><ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/dashboard/contacts" className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"><div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}><Users className="h-5 w-5" style={{ color: '#006B3F' }} /></div><div className="flex-1"><div className="font-medium">Import Contacts</div><div className="text-sm text-muted-foreground">Add new contacts to your list</div></div><ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/dashboard/wallet" className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all"><div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}><Wallet className="h-5 w-5" style={{ color: '#000' }} /></div><div className="flex-1"><div className="font-medium">Top Up Wallet</div><div className="text-sm text-muted-foreground">Add more SMS credits</div></div><ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
