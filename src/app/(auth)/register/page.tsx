'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Eye, EyeOff, Loader2, ArrowLeft, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
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
    if (cleaned.startsWith('234')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
    if (!cleaned.startsWith('+')) return `+${cleaned}`;
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
        setStep(2); // Verification step
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: formData.email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Verification failed');
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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Send className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">TextFlow Pro</span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold mb-2">Create your account</h1>
              <p className="text-muted-foreground mb-8">
                Start your 14-day free trial. No credit card required.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
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
                    className="input w-full"
                    placeholder="John Doe"
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
                    className="input w-full"
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
                    className="input w-full"
                    placeholder="+2348012345678"
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
                  
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground/50" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </div>
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
                    className="input w-full"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="btn btn-primary w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
              <p className="text-muted-foreground mb-8">
                We&apos;ve sent a verification code to <span className="font-medium">{formData.email}</span>
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Verification code
                  </label>
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="input w-full text-center text-2xl tracking-widest"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerify((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>

                <button
                  onClick={(e) => {
                    const input = document.getElementById('code') as HTMLInputElement;
                    handleVerify(input.value);
                  }}
                  disabled={isLoading}
                  className="btn btn-primary w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify email'
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{' '}
                  <button className="text-primary hover:underline">
                    Resend code
                  </button>
                </p>
              </div>
            </>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-secondary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl font-bold mb-6">Start for Free</div>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Get started with 100 free SMS credits. No credit card required.
            </p>
            <div className="space-y-3 text-left">
              {[
                '14-day free trial',
                'No credit card required',
                'Cancel anytime',
                'Access to all features',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
