'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useWallet } from '@/providers';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  LayoutDashboard,
  Send,
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

  const currentPage = navigation.find(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );

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
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#006B3F' }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <Send className="h-4 w-4 text-white" />
              </motion.div>
              <span className="font-bold">TextFlow</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) || pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  style={isActive ? { backgroundColor: '#006B3F' } : {}}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ backgroundColor: '#006B3F' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? '' : ''}`} />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Wallet Balance */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <motion.div
              className="rounded-lg p-4 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #006B3F 0%, #004d2e 100%)' }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 bg-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="text-xs opacity-80 mb-1">Wallet Balance</div>
              <div className="text-2xl font-bold">GH₵{parseFloat(balance).toFixed(2)}</div>
              <Link
                href="/dashboard/wallet"
                className="mt-2 inline-block text-xs hover:underline"
                style={{ color: '#FCD116' }}
              >
                Top up →
              </Link>
            </motion.div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#006B3F' }}
            >
              <Send className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">TextFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white font-medium text-sm"
                style={{ backgroundColor: '#006B3F' }}
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
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: '#006B3F' }}
                  >
                    <Send className="h-4 w-4 text-white" />
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
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive ? 'text-white' : 'hover:bg-accent'
                        }`}
                        style={isActive ? { backgroundColor: '#006B3F' } : {}}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <div
                  className="rounded-lg p-4 text-white"
                  style={{ background: 'linear-gradient(135deg, #006B3F 0%, #004d2e 100%)' }}
                >
                  <div className="text-xs opacity-80 mb-1">Wallet Balance</div>
                  <div className="text-2xl font-bold">GH₵{parseFloat(balance).toFixed(2)}</div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        {/* Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-20 h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-6">
          <div>
            <h2 className="text-lg font-semibold">{currentPage?.name || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
              <Bell className="h-4 w-4" />
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: '#CE1126' }}
              />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border px-2 py-1.5 hover:bg-accent transition-colors"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: '#006B3F' }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">{user?.fullName || 'User'}</span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-card shadow-lg"
                    >
                      <div className="p-3 border-b">
                        <div className="font-medium">{user?.fullName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                        <div className="mt-1">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: '#006B3F' }}
                          >
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <div className="p-1">
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
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
          </div>
        </header>

        <main className="pt-14 md:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile User Dropdown */}
      <AnimatePresence>
        {userMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed right-4 top-14 z-50 w-56 rounded-xl border bg-card shadow-lg"
            >
              <div className="p-3 border-b">
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                <div className="mt-1">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: '#006B3F' }}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="p-1">
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile Settings
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
