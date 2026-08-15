'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Send, CheckCircle2, XCircle, Clock, Download, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#006B3F', '#FCD116', '#CE1126'];

type AnalyticsResponse = {
  stats: { totalSms: number; delivered: number; failed: number; pending: number; totalSpent: number; contacts: number; groups: number };
  chartData: { name: string; sms: number; api: number }[];
  deliveryData: { name: string; value: number }[];
  recentLogs: { id: string; recipient: string; message: string; status: string; cost: string; createdAt: string }[];
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async (days: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/summary?days=${days}`);
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed to load analytics');
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  const exportLogs = () => {
    if (!data?.recentLogs.length) return;
    const header = 'Recipient,Message,Status,Cost (GHS),Date';
    const rows = data.recentLogs.map((log) => [
      log.recipient,
      `"${log.message.replaceAll('"', '""')}"`,
      log.status,
      log.cost,
      new Date(log.createdAt).toISOString(),
    ].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `textflow-sms-${period}d.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !data) {
    return <div className="space-y-8"><div className="h-36 rounded-xl border bg-card skeleton" /><div className="h-96 rounded-xl border bg-card skeleton" /></div>;
  }

  const stats = data?.stats || { totalSms: 0, delivered: 0, failed: 0, pending: 0, totalSpent: 0, contacts: 0, groups: 0 };
  const deliveryRate = stats.totalSms > 0 ? ((stats.delivered / stats.totalSms) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Live SMS performance and wallet usage from your account.</p>
        </div>
        <div className="flex gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input w-36">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={exportLogs} disabled={!data?.recentLogs.length} className="btn btn-outline">
            <Download className="h-4 w-4" /> Export loaded logs
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Send, label: 'SMS Sent', value: stats.totalSms.toLocaleString(), color: '#006B3F', bg: '#006B3F20' },
          { icon: CheckCircle2, label: 'Delivery Rate', value: deliveryRate ? `${deliveryRate}%` : '—', color: '#006B3F', bg: '#006B3F20' },
          { icon: XCircle, label: 'Failed', value: stats.failed.toLocaleString(), color: '#CE1126', bg: '#CE112620' },
          { icon: null, label: 'Total Cost', value: stats.totalSms ? `GH₵${stats.totalSpent.toFixed(2)}` : '—', color: '#000', bg: '#FCD11630', cedi: true },
        ].map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between"><div className="p-2 rounded-lg" style={{ backgroundColor: card.bg }}>{card.cedi ? <span className="text-lg font-bold">GH₵</span> : card.icon && <card.icon className="h-5 w-5" style={{ color: card.color }} />}</div>{index < 3 && <TrendingUp className="h-4 w-4" style={{ color: '#006B3F' }} />}</div>
            <div className="mt-4"><div className="text-3xl font-bold">{card.value}</div><div className="text-sm text-muted-foreground">{card.label}</div></div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="mb-6"><h3 className="font-semibold">SMS Volume</h3><p className="text-xs text-muted-foreground">Web and API messages in the selected period</p></div>
          {data?.chartData.some((item) => item.sms || item.api) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.chartData}><defs><linearGradient id="analyticsWeb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} /><stop offset="95%" stopColor="#006B3F" stopOpacity={0} /></linearGradient><linearGradient id="analyticsApi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FCD116" stopOpacity={0.3} /><stop offset="95%" stopColor="#FCD116" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" interval="preserveStartEnd" className="text-xs" /><YAxis allowDecimals={false} className="text-xs" /><Tooltip /><Area type="monotone" dataKey="sms" name="Web" stroke="#006B3F" fill="url(#analyticsWeb)" /><Area type="monotone" dataKey="api" name="API" stroke="#FCD116" fill="url(#analyticsApi)" /></AreaChart></ResponsiveContainer></div> : <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No SMS activity in this period.</div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-6">Delivery Status</h3>
          {data?.deliveryData.length ? <><div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.deliveryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{data.deliveryData.map((_, index) => <Cell key={`status-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-2 mt-4">{data.deliveryData.map((item, index) => <div key={item.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} /><span>{item.name}</span></div><span className="font-medium">{item.value.toLocaleString()}</span></div>)}</div></> : <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No delivery data yet.</div>}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
        <div className="p-6 border-b"><h3 className="font-semibold">Recent Messages</h3><p className="text-xs text-muted-foreground">Latest records returned by the platform</p></div>
        {data?.recentLogs.length ? <div className="divide-y">{data.recentLogs.map((log) => <div key={log.id} className="flex items-center justify-between p-4"><div className="flex items-center gap-3">{log.status === 'DELIVERED' ? <CheckCircle2 className="h-4 w-4" style={{ color: '#006B3F' }} /> : log.status === 'FAILED' || log.status === 'REJECTED' ? <XCircle className="h-4 w-4" style={{ color: '#CE1126' }} /> : <Clock className="h-4 w-4 text-yellow-500" />}<div><div className="font-medium text-sm">{log.recipient}</div><div className="text-xs text-muted-foreground truncate max-w-[300px]">{log.message}</div></div></div><div className="text-right"><div className="text-sm font-medium">GH₵{parseFloat(log.cost).toFixed(3)}</div><div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString('en-GH')}</div></div></div>)}</div> : <div className="p-12 text-center text-sm text-muted-foreground">No messages have been sent yet.</div>}
      </motion.div>
    </div>
  );
}
