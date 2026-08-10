'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Clock, ArrowRight } from 'lucide-react';

type VerifyState = 'verifying' | 'success' | 'failed' | 'pending' | 'error';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [state, setState] = useState<VerifyState>('verifying');
  const [message, setMessage] = useState('Confirming your payment...');
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setState('error');
      setMessage('No payment reference was provided.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/wallet/verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (res.ok && data.success && data.status === 'COMPLETED') {
          setState('success');
          setAmount(data.amount);
          setMessage('Your wallet has been topped up successfully!');
          return;
        }

        if (data.status === 'FAILED') {
          setState('failed');
          setMessage(data.error || 'This payment was not successful.');
          return;
        }

        // Still pending - retry a few times in case the gateway is slow to confirm.
        if (attempts < maxAttempts) {
          setState('pending');
          setMessage('Payment is still processing. Checking again...');
          setTimeout(poll, 2500);
        } else {
          setState('pending');
          setMessage('Your payment is taking longer than usual to confirm. It will reflect automatically once completed.');
        }
      } catch {
        setState('error');
        setMessage('Could not verify payment status. Please check your wallet balance shortly.');
      }
    };

    poll();
  }, [reference]);

  const icons: Record<VerifyState, React.ReactNode> = {
    verifying: <Loader2 className="h-16 w-16 animate-spin" style={{ color: '#006B3F' }} />,
    pending: <Clock className="h-16 w-16 text-yellow-500" />,
    success: <CheckCircle2 className="h-16 w-16" style={{ color: '#006B3F' }} />,
    failed: <XCircle className="h-16 w-16" style={{ color: '#CE1126' }} />,
    error: <XCircle className="h-16 w-16" style={{ color: '#CE1126' }} />,
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-md w-full rounded-2xl border bg-card p-8 text-center"
      >
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          {icons[state]}
        </motion.div>

        <h1 className="text-xl font-bold mb-2">
          {state === 'verifying' && 'Verifying Payment'}
          {state === 'pending' && 'Payment Processing'}
          {state === 'success' && 'Payment Successful!'}
          {state === 'failed' && 'Payment Failed'}
          {state === 'error' && 'Verification Error'}
        </h1>

        <p className="text-muted-foreground mb-6">{message}</p>

        {state === 'success' && amount && (
          <div
            className="mb-6 p-4 rounded-lg text-white"
            style={{ background: 'linear-gradient(135deg, #006B3F 0%, #004d2e 100%)' }}
          >
            <div className="text-sm opacity-80">Amount Credited</div>
            <div className="text-2xl font-bold">GH₵{parseFloat(amount).toFixed(2)}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard/wallet')}
            className="btn text-white h-11 px-6"
            style={{ backgroundColor: '#006B3F' }}
          >
            Go to Wallet
            <ArrowRight className="h-4 w-4" />
          </button>
          {(state === 'failed' || state === 'error') && (
            <Link
              href="/dashboard/wallet"
              className="btn btn-outline h-11 px-6"
            >
              Try Again
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#006B3F' }} />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
