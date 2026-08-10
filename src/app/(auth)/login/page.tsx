'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Use full navigation so middleware picks up the new cookies
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      window.location.href = redirect;
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#006B3F' }}
            >
              <Send className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">TextFlow Pro</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your SMS dashboard
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: '#006B3F' }}>
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn w-full h-11 text-white"
              style={{ backgroundColor: '#006B3F' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: '#006B3F' }}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div
        className="hidden lg:flex lg:flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #006B3F 0%, #004d2e 100%)' }}
      >
        {/* Animated decorative circles */}
        <motion.div
          className="absolute top-16 right-16 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: '#FCD116' }}
          animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-16 left-16 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: '#CE1126' }}
          animate={{ scale: [1, 1.2, 1], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity }}
        />

        <div className="max-w-md text-center text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl font-bold mb-6">Send SMS at Scale</div>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of Ghanaian businesses using TextFlow Pro to connect with their customers.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                <div className="text-2xl font-bold">50M+</div>
                <div className="text-sm text-white/70">Messages</div>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                <div className="text-2xl font-bold">99.5%</div>
                <div className="text-sm text-white/70">Delivery</div>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-white/70">Networks</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
