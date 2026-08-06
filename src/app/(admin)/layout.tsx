'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers';
import {
  LayoutDashboard,
  Users,
  Settings,
  Wallet,
  Send,
  BarChart3,
  Globe,
  Shield,
  ChevronLeft,
  Menu,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Transactions', href: '/admin/transactions', icon: Wallet },
  { name: 'SMS Logs', href: '/admin/sms', icon: Send },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Pricing', href: '/admin/pricing', icon: Globe },
  { name: 'Providers', href: '/admin/providers', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#006B3F' }} />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

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
            <Link href="/admin" className="flex items-center gap-2">
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#CE1126' }}
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">Admin Panel</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-2 rounded-lg hover:bg-accent"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                style={isActive ? { backgroundColor: '#CE1126' } : {}}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Link>
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
          
          <Link href="/admin" className="flex items-center gap-2">
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#CE1126' }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Admin</span>
          </Link>

          <div 
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: '#CE1126' }}
          >
            {user?.fullName?.charAt(0) || 'A'}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
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
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r md:hidden"
            >
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <span className="font-bold">Admin Panel</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-accent">
                  ✕
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                        isActive ? 'text-white' : 'hover:bg-accent'
                      }`}
                      style={isActive ? { backgroundColor: '#CE1126' } : {}}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        {/* Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-20 h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-6">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: '#CE1126' }}
            >
              <Shield className="h-3 w-3" />
              Admin Mode
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: '#CE1126' }}
            >
              {user?.fullName?.charAt(0) || 'A'}
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
    </div>
  );
}
