'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  metrics: { totalRevenue: number; monthlyRevenue: number; smsDelivered: number; smsFailed: number; smsPending: number; totalUsers: number; activeUsers: number; agentUsers: number; developerUsers: number };
  revenueChartData: { name: string; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed to load analytics');
        return payload;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-xl border bg-card skeleton" />)}</div><div className="h-80 rounded-xl border bg-card skeleton" /></div>;

  const metrics = data?.metrics || { totalRevenue: 0, monthlyRevenue: 0, smsDelivered: 0, smsFailed: 0, smsPending: 0, totalUsers: 0, activeUsers: 0, agentUsers: 0, developerUsers: 0 };
  const deliveryRate = metrics.smsDelivered + metrics.smsFailed > 0 ? `${((metrics.smsDelivered / (metrics.smsDelivered + metrics.smsFailed)) * 100).toFixed(1)}%` : '—';
  const hasRevenue = data?.revenueChartData.some((item) => item.revenue > 0);

  const cards = [
    { icon: DollarSign, label: 'Total Revenue', value: `GH₵${metrics.totalRevenue.toFixed(2)}`, color: '#006B3F', bg: '#006B3F20' },
    { icon: Send, label: 'SMS Delivered', value: metrics.smsDelivered.toLocaleString(), color: '#006B3F', bg: '#006B3F20' },
    { icon: Users, label: 'Active Users', value: metrics.activeUsers.toLocaleString(), color: '#2563EB', bg: '#2563EB20' },
    { icon: TrendingUp, label: 'Delivery Rate', value: deliveryRate, color: '#8B5CF6', bg: '#8B5CF620' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Platform-wide metrics calculated from live records.</p></div>
      {error && <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{cards.map((card, index) => <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all"><div className="p-2 rounded-lg w-fit" style={{ backgroundColor: card.bg }}><card.icon className="h-5 w-5" style={{ color: card.color }} /></div><div className="mt-4"><div className="text-3xl font-bold">{card.value}</div><div className="text-sm text-muted-foreground">{card.label}</div></div></motion.div>)}</div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6"><h3 className="font-semibold mb-6">Revenue Trend</h3>{hasRevenue ? <div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data?.revenueChartData}><defs><linearGradient id="adminAnalyticsRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} /><stop offset="95%" stopColor="#006B3F" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => [`GH₵${Number(value).toFixed(2)}`, 'Revenue']} /><Area type="monotone" dataKey="revenue" stroke="#006B3F" fill="url(#adminAnalyticsRevenue)" /></AreaChart></ResponsiveContainer></div> : <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">No completed payments recorded yet.</div>}</motion.div>
    </div>
  );
}
