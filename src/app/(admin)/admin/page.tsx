'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Send,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Metrics {
  totalRevenue: number;
  monthlyRevenue: number;
  estimatedProfit: number;
  smsDelivered: number;
  smsFailed: number;
  smsPending: number;
  totalUsers: number;
  activeUsers: number;
  agentUsers: number;
  developerUsers: number;
}

interface RecentTransaction {
  id: string;
  userEmail: string;
  type: string;
  amount: string;
  reason: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    estimatedProfit: 0,
    smsDelivered: 0,
    smsFailed: 0,
    smsPending: 0,
    totalUsers: 0,
    activeUsers: 0,
    agentUsers: 0,
    developerUsers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [smsChartData, setSmsChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMetrics({
        totalRevenue: 45890.50,
        monthlyRevenue: 8234.25,
        estimatedProfit: 12450.00,
        smsDelivered: 245000,
        smsFailed: 3200,
        smsPending: 1500,
        totalUsers: 2847,
        activeUsers: 2650,
        agentUsers: 145,
        developerUsers: 52,
      });

      setRecentTransactions([
        { id: '1', userEmail: 'john@example.com', type: 'CREDIT', amount: '500.00', reason: 'DEPOSIT', createdAt: '2 mins ago' },
        { id: '2', userEmail: 'sarah@techcorp.com', type: 'DEBIT', amount: '25.00', reason: 'SMS_PURCHASE', createdAt: '5 mins ago' },
        { id: '3', userEmail: 'mike@startup.io', type: 'CREDIT', amount: '1000.00', reason: 'ADMIN_CREDIT', createdAt: '12 mins ago' },
        { id: '4', userEmail: 'emma@design.co', type: 'DEBIT', amount: '8.50', reason: 'SMS_PURCHASE', createdAt: '15 mins ago' },
        { id: '5', userEmail: 'alex@agency.net', type: 'CREDIT', amount: '250.00', reason: 'DEPOSIT', createdAt: '30 mins ago' },
      ]);

      setRevenueChartData([
        { name: 'Jan', revenue: 12000, costs: 8000 },
        { name: 'Feb', revenue: 15000, costs: 9500 },
        { name: 'Mar', revenue: 18000, costs: 11000 },
        { name: 'Apr', revenue: 22000, costs: 13500 },
        { name: 'May', revenue: 28000, costs: 17000 },
        { name: 'Jun', revenue: 35000, costs: 21000 },
      ]);

      setSmsChartData([
        { name: 'Web', delivered: 145000, failed: 1800 },
        { name: 'API', delivered: 100000, failed: 1400 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border bg-card skeleton" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-xl border bg-card skeleton" />
          <div className="h-80 rounded-xl border bg-card skeleton" />
        </div>
      </div>
    );
  }

  const profitMargin = metrics.monthlyRevenue > 0 
    ? ((metrics.estimatedProfit / metrics.monthlyRevenue) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform&apos;s performance</p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +18%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Revenue (Lifetime)</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-secondary/10">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-sm text-muted-foreground">{profitMargin}% margin</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">${metrics.estimatedProfit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Est. Net Profit</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
        </motion.div>
      </div>

      {/* SMS Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{(metrics.smsDelivered / 1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">SMS Delivered</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="h-4 w-4" />
              -2%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{metrics.smsFailed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Failed</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{metrics.smsPending.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">SMS Pending</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Send className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {(((metrics.smsDelivered + metrics.smsFailed) > 0 
                ? metrics.smsDelivered / (metrics.smsDelivered + metrics.smsFailed) 
                : 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Revenue vs Costs</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="costs" stroke="#6366F1" fillOpacity={1} fill="url(#colorCosts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Provider Costs</span>
            </div>
          </div>
        </motion.div>

        {/* SMS by Channel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">SMS by Channel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={smsChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="delivered" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Failed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Stats & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Regular Users</span>
                <span className="text-sm font-medium">{metrics.totalUsers - metrics.agentUsers - metrics.developerUsers}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${((metrics.totalUsers - metrics.agentUsers - metrics.developerUsers) / metrics.totalUsers) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Agents</span>
                <span className="text-sm font-medium">{metrics.agentUsers}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${(metrics.agentUsers / metrics.totalUsers) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Developers</span>
                <span className="text-sm font-medium">{metrics.developerUsers}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(metrics.developerUsers / metrics.totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="font-semibold">Recent Transactions</h3>
            <a href="/admin/transactions" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4">
                <div className={`p-2 rounded-full ${
                  tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {tx.type === 'CREDIT' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tx.userEmail}</div>
                  <div className="text-xs text-muted-foreground">{tx.reason}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">{tx.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
