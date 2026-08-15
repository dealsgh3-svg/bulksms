'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Send,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  smsDelivered: number;
  smsFailed: number;
  smsPending: number;
  totalUsers: number;
  activeUsers: number;
  agentUsers: number;
  developerUsers: number;
}

interface AdminAnalyticsData {
  metrics: AdminMetrics;
  revenueChartData: { name: string; revenue: number }[];
  smsChartData: { name: string; delivered: number; failed: number }[];
  recentTransactions: { id: string; userEmail: string; type: string; amount: string; reason: string; createdAt: string }[];
}

const emptyMetrics: AdminMetrics = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  smsDelivered: 0,
  smsFailed: 0,
  smsPending: 0,
  totalUsers: 0,
  activeUsers: 0,
  agentUsers: 0,
  developerUsers: 0,
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData>({ metrics: emptyMetrics, revenueChartData: [], smsChartData: [], recentTransactions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed to load analytics');
        return payload as AdminAnalyticsData;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="space-y-8"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[...Array(8)].map((_, i) => <div key={i} className="h-36 rounded-xl border bg-card skeleton" />)}</div><div className="h-80 rounded-xl border bg-card skeleton" /></div>;
  }

  const { metrics } = data;
  const deliveryRate = metrics.smsDelivered + metrics.smsFailed > 0 ? ((metrics.smsDelivered / (metrics.smsDelivered + metrics.smsFailed)) * 100).toFixed(1) : null;
  const regularUsers = Math.max(0, metrics.totalUsers - metrics.agentUsers - metrics.developerUsers);
  const hasRevenue = data.revenueChartData.some((item) => item.revenue > 0);
  const hasChannelData = data.smsChartData.some((item) => item.delivered > 0 || item.failed > 0);

  const metricCards = [
    { icon: DollarSign, label: 'Monthly Revenue', value: `GH₵${metrics.monthlyRevenue.toFixed(2)}`, color: '#006B3F', bg: '#006B3F20' },
    { icon: DollarSign, label: 'Total Revenue', value: `GH₵${metrics.totalRevenue.toFixed(2)}`, color: '#006B3F', bg: '#006B3F20' },
    { icon: TrendingUp, label: 'Net Profit', value: '—', helper: 'Provider cost data not configured', color: '#8B5CF6', bg: '#8B5CF620' },
    { icon: Wallet, label: 'Active Users', value: metrics.activeUsers.toLocaleString(), color: '#2563EB', bg: '#2563EB20' },
  ];

  const smsCards = [
    { icon: CheckCircle2, label: 'SMS Delivered', value: metrics.smsDelivered.toLocaleString(), color: '#006B3F', bg: '#006B3F20' },
    { icon: XCircle, label: 'SMS Failed', value: metrics.smsFailed.toLocaleString(), color: '#CE1126', bg: '#CE112620' },
    { icon: Clock, label: 'SMS Pending', value: metrics.smsPending.toLocaleString(), color: '#CA8A04', bg: '#FCD11630' },
    { icon: Send, label: 'Delivery Rate', value: deliveryRate ? `${deliveryRate}%` : '—', color: '#8B5CF6', bg: '#8B5CF620' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Live platform performance from your database.</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, index) => <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all"><div className="flex items-center justify-between"><div className="p-2 rounded-lg" style={{ backgroundColor: card.bg }}><card.icon className="h-5 w-5" style={{ color: card.color }} /></div></div><div className="mt-4"><div className="text-3xl font-bold">{card.value}</div><div className="text-sm text-muted-foreground">{card.label}</div>{card.helper && <div className="text-xs text-muted-foreground mt-1">{card.helper}</div>}</div></motion.div>)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {smsCards.map((card, index) => <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 4) * 0.08 }} whileHover={{ y: -4 }} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all"><div className="p-2 rounded-lg w-fit" style={{ backgroundColor: card.bg }}><card.icon className="h-5 w-5" style={{ color: card.color }} /></div><div className="mt-4"><div className="text-3xl font-bold">{card.value}</div><div className="text-sm text-muted-foreground">{card.label}</div></div></motion.div>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6"><h3 className="font-semibold mb-4">Revenue Trend</h3>{hasRevenue ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenueChartData}><defs><linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} /><stop offset="95%" stopColor="#006B3F" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => [`GH₵${Number(value).toFixed(2)}`, 'Revenue']} /><Area type="monotone" dataKey="revenue" stroke="#006B3F" fill="url(#adminRevenue)" /></AreaChart></ResponsiveContainer></div> : <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No completed payments recorded yet.</div>}</motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6"><h3 className="font-semibold mb-4">SMS by Channel</h3>{hasChannelData ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.smsChartData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="delivered" name="Delivered" fill="#006B3F" radius={[4, 4, 0, 0]} /><Bar dataKey="failed" name="Failed" fill="#CE1126" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No SMS delivery records yet.</div>}</motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6"><h3 className="font-semibold mb-4">User Distribution</h3>{metrics.totalUsers > 0 ? <div className="space-y-4">{[{ label: 'Regular Users', value: regularUsers, color: '#006B3F' }, { label: 'Agents', value: metrics.agentUsers, color: '#FCD116' }, { label: 'Developers', value: metrics.developerUsers, color: '#CE1126' }].map((item) => <div key={item.label}><div className="flex items-center justify-between mb-1"><span className="text-sm">{item.label}</span><span className="text-sm font-medium">{item.value}</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ backgroundColor: item.color, width: `${(item.value / metrics.totalUsers) * 100}%` }} /></div></div>)}</div> : <div className="py-10 text-center text-sm text-muted-foreground">No users recorded yet.</div>}</motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card"><div className="flex items-center justify-between p-6 border-b"><h3 className="font-semibold">Recent Transactions</h3></div>{data.recentTransactions.length ? <div className="divide-y">{data.recentTransactions.map((tx) => <div key={tx.id} className="flex items-center gap-4 p-4"><div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{tx.type === 'CREDIT' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</div><div className="flex-1 min-w-0"><div className="font-medium truncate">{tx.userEmail}</div><div className="text-xs text-muted-foreground">{tx.reason}</div></div><div className="text-right"><div className={`font-semibold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'CREDIT' ? '+' : '-'}GH₵{parseFloat(tx.amount).toFixed(2)}</div><div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-GH')}</div></div></div>)}</div> : <div className="p-10 text-center text-sm text-muted-foreground">No transactions recorded yet.</div>}</motion.div>
      </div>
    </div>
  );
}
