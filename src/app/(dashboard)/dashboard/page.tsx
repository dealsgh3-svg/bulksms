'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Send,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981'];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSms: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    totalSpent: 0,
    apiCalls: 0,
    contacts: 0,
    groups: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalSms: 12450,
        delivered: 11805,
        failed: 245,
        pending: 400,
        totalSpent: 249.00,
        apiCalls: 3420,
        contacts: 2850,
        groups: 12,
      });
      setRecentLogs([
        { id: 1, recipient: '+2348012345678', message: 'Your order has been shipped...', status: 'DELIVERED', cost: '0.020', createdAt: '2 mins ago' },
        { id: 2, recipient: '+2348098765432', message: 'Hello, welcome to our plat...', status: 'SENT', cost: '0.020', createdAt: '5 mins ago' },
        { id: 3, recipient: '+2347051234567', message: 'Your OTP is 123456', status: 'DELIVERED', cost: '0.020', createdAt: '12 mins ago' },
        { id: 4, recipient: '+2348023456789', message: 'Reminder: Your appointm...', status: 'PENDING', cost: '0.040', createdAt: '15 mins ago' },
        { id: 5, recipient: '+2348167890123', message: 'Thank you for registering...', status: 'DELIVERED', cost: '0.020', createdAt: '30 mins ago' },
      ]);
      setChartData([
        { name: 'Mon', sms: 1200, api: 400 },
        { name: 'Tue', sms: 1900, api: 600 },
        { name: 'Wed', sms: 1500, api: 500 },
        { name: 'Thu', sms: 2100, api: 700 },
        { name: 'Fri', sms: 2400, api: 800 },
        { name: 'Sat', sms: 1800, api: 400 },
        { name: 'Sun', sms: 900, api: 200 },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statusIcons = {
    DELIVERED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    SENT: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const pieData = [
    { name: 'Delivered', value: stats.delivered },
    { name: 'Failed', value: stats.failed },
    { name: 'Pending', value: stats.pending },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border bg-card skeleton" />
          ))}
        </div>
        <div className="h-96 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your SMS campaigns.</p>
        </div>
        <Link href="/dashboard/sms" className="btn btn-primary">
          <Send className="h-4 w-4" />
          Send SMS
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.totalSms.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total SMS Sent</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +8%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{((stats.delivered / stats.totalSms) * 100).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Wallet className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +5%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{stats.contacts.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SMS Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">SMS Volume (Last 7 Days)</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Web</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span>API</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="sms" stroke="#6366F1" fillOpacity={1} fill="url(#colorSms)" />
                <Area type="monotone" dataKey="api" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorApi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Delivery Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Delivery Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, index) => (
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent SMS Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="font-semibold">Recent Messages</h3>
            <Link href="/dashboard/analytics" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {statusIcons[log.status as keyof typeof statusIcons]}
                  <div>
                    <div className="font-medium text-sm">{log.recipient}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {log.message}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${log.cost}</div>
                  <div className="text-xs text-muted-foreground">{log.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/sms"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Send Quick SMS</div>
                <div className="text-sm text-muted-foreground">Send a single message</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              href="/dashboard/sms/bulk"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="p-2 rounded-lg bg-secondary/10">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Bulk SMS</div>
                <div className="text-sm text-muted-foreground">Upload CSV for mass sending</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              href="/dashboard/contacts"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Import Contacts</div>
                <div className="text-sm text-muted-foreground">Add new contacts to your list</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Top Up Wallet</div>
                <div className="text-sm text-muted-foreground">Add more SMS credits</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
