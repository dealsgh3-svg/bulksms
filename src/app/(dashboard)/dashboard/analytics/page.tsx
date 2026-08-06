'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Send, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#006B3F', '#FCD116', '#CE1126', '#000000'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  const smsData = [
    { name: 'Mon', sent: 1200, delivered: 1150, failed: 50 },
    { name: 'Tue', sent: 1900, delivered: 1820, failed: 80 },
    { name: 'Wed', sent: 1500, delivered: 1440, failed: 60 },
    { name: 'Thu', sent: 2100, delivered: 2020, failed: 80 },
    { name: 'Fri', sent: 2400, delivered: 2320, failed: 80 },
    { name: 'Sat', sent: 1800, delivered: 1740, failed: 60 },
    { name: 'Sun', sent: 900, delivered: 870, failed: 30 },
  ];

  const networkData = [
    { name: 'MTN', value: 5400 },
    { name: 'Telecel', value: 3200 },
    { name: 'AT', value: 2100 },
  ];

  const recentLogs = [
    { id: '1', recipient: '+233241234567', message: 'Your order has been shipped...', status: 'DELIVERED', cost: '0.05', network: 'MTN', createdAt: '2 mins ago' },
    { id: '2', recipient: '+233202345678', message: 'Payment received: GH₵150.00...', status: 'DELIVERED', cost: '0.05', network: 'Telecel', createdAt: '5 mins ago' },
    { id: '3', recipient: '+233261234567', message: 'Appointment reminder...', status: 'PENDING', cost: '0.05', network: 'AT', createdAt: '12 mins ago' },
    { id: '4', recipient: '+233241112222', message: 'Special offer: 20% off...', status: 'FAILED', cost: '0.05', network: 'MTN', createdAt: '15 mins ago' },
  ];

  const stats = {
    totalSent: 11800,
    totalDelivered: 11360,
    totalFailed: 440,
    deliveryRate: 96.3,
    totalCost: 590.00,
    avgCost: 0.05,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your SMS performance and costs</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-32"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn btn-outline">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: '#006B3F' }}>
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Sent</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: '#006B3F' }}>
              <TrendingUp className="h-4 w-4" />
              +8%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.deliveryRate}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#CE112620' }}>
              <XCircle className="h-5 w-5" style={{ color: '#CE1126' }} />
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: '#CE1126' }}>
              <TrendingDown className="h-4 w-4" />
              -2%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalFailed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
              <span className="text-lg font-bold" style={{ color: '#000' }}>GH₵</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">GH₵{stats.totalCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-6">SMS Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={smsData}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006B3F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="delivered" stroke="#006B3F" fillOpacity={1} fill="url(#colorDelivered)" />
                <Area type="monotone" dataKey="failed" stroke="#CE1126" fill="#CE112620" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-6">Network Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {networkData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {networkData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold">Recent Messages</h3>
        </div>
        <div className="divide-y">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {log.status === 'DELIVERED' ? (
                  <CheckCircle2 className="h-4 w-5" style={{ color: '#006B3F' }} />
                ) : log.status === 'FAILED' ? (
                  <XCircle className="h-4 w-5" style={{ color: '#CE1126' }} />
                ) : (
                  <Clock className="h-4 w-5 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium text-sm">{log.recipient}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[300px]">{log.message}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">GH₵{log.cost}</div>
                <div className="text-xs text-muted-foreground">{log.network}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
