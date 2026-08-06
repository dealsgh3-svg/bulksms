'use client';

import { motion } from 'framer-motion';
import { DollarSign, Send, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalyticsPage() {
  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 22000 },
    { name: 'May', revenue: 28000 },
    { name: 'Jun', revenue: 35000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
              <span className="text-lg font-bold" style={{ color: '#000' }}>GH₵</span>
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: '#006B3F' }}>
              <TrendingUp className="h-4 w-4" />
              +18%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">GH₵45,890</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Send className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">245K</div>
            <div className="text-sm text-muted-foreground">SMS Delivered</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Users className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">2,847</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">99.5%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-6">Revenue Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006B3F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#006B3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#006B3F" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
