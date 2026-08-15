'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Bell, Save, Palette } from 'lucide-react';
import { ThemeSwitch } from '@/components/theme-toggle';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: 'Kwame Asante',
    email: 'kwame@example.com',
    phone: '+233241234567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    deliveryReceipts: true,
    lowBalance: true,
    promotions: false,
    securityAlerts: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
            <Palette className="h-5 w-5" style={{ color: '#000' }} />
          </div>
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-sm text-muted-foreground">Switch between light and dark mode</div>
          </div>
          <ThemeSwitch />
        </div>
      </motion.div>

      {/* Profile Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
            <User className="h-5 w-5" style={{ color: '#006B3F' }} />
          </div>
          <h2 className="font-semibold">Profile Information</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="input w-full pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input w-full pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="input w-full pl-10"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#CE112620' }}>
            <Lock className="h-5 w-5" style={{ color: '#CE1126' }} />
          </div>
          <h2 className="font-semibold">Change Password</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>
          <div />
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={profile.newPassword}
              onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={profile.confirmPassword}
              onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
            <Bell className="h-5 w-5" style={{ color: '#000' }} />
          </div>
          <h2 className="font-semibold">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: 'deliveryReceipts', label: 'Delivery Receipts', description: 'Get notified when your SMS is delivered' },
            { key: 'lowBalance', label: 'Low Balance Alerts', description: 'Receive alerts when your balance is below GH₵10' },
            { key: 'promotions', label: 'Promotional Offers', description: 'Receive updates about discounts and new features' },
            { key: 'securityAlerts', label: 'Security Alerts', description: 'Get notified about suspicious account activity' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-end">
        <button 
          className="btn btn-primary"
          style={{ backgroundColor: '#006B3F' }}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </motion.div>
    </div>
  );
}
