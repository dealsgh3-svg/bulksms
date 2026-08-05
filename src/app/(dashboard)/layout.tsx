'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useWallet } from '@/providers';
import {
  LayoutDashboard,
  Send,
  Users,
  Wallet,
  BarChart3,
  Contact2,
  Code2,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Send SMS', href: '/dashboard/sms', icon: Send },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Contact2 },
  { name: 'Sender IDs', href: '/dashboard/sender-ids', icon: Shield },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Developer', href: '/dashboard/developer', icon: Code2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } hidden md:block`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Send className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">TextFlow</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-2 rounded-lg hover:bg-accent"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Balance */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
              <div className="text-2xl font-bold">${parseFloat(balance).toFixed(2)}</div>
              <Link
                href="/dashboard/wallet"
                className="mt-2 block text-xs text-primary hover:underline"
              >
                Top up →
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Send className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">TextFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-sm"
              >
                {user?.fullName?.charAt(0) || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r md:hidden"
            >
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Send className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold">TextFlow</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
                  <div className="text-2xl font-bold">${parseFloat(balance).toFixed(2)}</div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`min-h-screen pt-14 md:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* User Dropdown */}
      <AnimatePresence>
        {userMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-4 top-14 z-50 w-56 rounded-xl border bg-card shadow-lg"
            >
              <div className="p-3 border-b">
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
                <Link
                  href="/help"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
