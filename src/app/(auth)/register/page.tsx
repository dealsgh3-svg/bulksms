'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, Eye, EyeOff, Loader2, ArrowLeft, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
  });

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
    { label: 'Passwords match', met: formData.password === formData.confirmPassword && formData.password.length > 0 },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const formatWhatsAppNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('233')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`;
    if (!cleaned.startsWith('+')) return cleaned ? `+${cleaned}` : '';
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          whatsappNumber: formData.whatsappNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Account created and logged in - redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#006B3F' }}
            >
              <Send className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">TextFlow Pro</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Start sending SMS to your customers across Ghana.
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
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input w-full transition-all focus:scale-[1.01]"
                placeholder="Kwame Asante"
              />
            </div>

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
                className="input w-full transition-all focus:scale-[1.01]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium mb-2">
                WhatsApp number <span className="text-destructive">*</span>
              </label>
              <input
                id="whatsapp"
                type="tel"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: formatWhatsAppNumber(e.target.value) })}
                className="input w-full transition-all focus:scale-[1.01]"
                placeholder="+233241234567"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for verification and support
              </p>
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
                  className="input w-full pr-10 transition-all focus:scale-[1.01]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 text-xs"
                    animate={{ x: req.met ? [0, 2, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3" style={{ color: '#006B3F' }} />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input w-full transition-all focus:scale-[1.01]"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="btn w-full h-11 text-white"
              style={{ backgroundColor: '#006B3F' }}
              whileHover={{ scale: isPasswordValid ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#006B3F' }}>
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="hover:underline" style={{ color: '#006B3F' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: '#006B3F' }}>Privacy Policy</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div
        className="hidden lg:flex lg:flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FCD116 0%, #e6bc14 100%)' }}
      >
        {/* Animated decorative circles */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: '#006B3F' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-56 h-56 rounded-full opacity-20"
          style={{ backgroundColor: '#CE1126' }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="max-w-md text-center relative z-10" style={{ color: '#000' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-5xl font-bold mb-6">Welcome to TextFlow Pro</div>
            <p className="text-xl mb-8" style={{ color: '#00000090' }}>
              Ghana&apos;s trusted bulk SMS platform for businesses of all sizes.
            </p>
            <div className="space-y-3 text-left">
              {[
                'Pay only for what you send',
                'No monthly fees or subscriptions',
                'Reach all Ghana networks',
                'Real-time delivery tracking',
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#006B3F' }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
