'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Clock, Loader2, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { useSettings } from '@/providers';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceAfter: string;
  reason: string;
  description?: string;
  reference: string;
  createdAt: string;
}

const GATEWAY_INFO: Record<string, { name: string; color: string; description: string }> = {
  KORA: {
    name: 'Kora Pay',
    color: '#006B3F',
    description: 'Pay securely with Mobile Money, Card, or Bank Transfer via Kora Pay.',
  },
  PAYSTACK: {
    name: 'Paystack',
    color: '#00C3F7',
    description: 'Pay securely with Mobile Money, Card, or Bank Transfer via Paystack.',
  },
};

export default function WalletPage() {
  const { settings } = useSettings();
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositResult, setDepositResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        fetch('/api/wallet/balance'),
        fetch('/api/wallet/transactions'),
      ]);

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data.balance || '0.00');
      }

      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeGateway = settings?.activePaymentGateway || 'KORA';
  const gatewayInfo = GATEWAY_INFO[activeGateway];
  const isGatewayConfigured = activeGateway === 'KORA' ? settings?.koraConfigured : settings?.paystackConfigured;

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 5) {
      setDepositResult({ success: false, error: 'Minimum deposit is GH₵5' });
      return;
    }

    setIsDepositing(true);
    setDepositResult(null);

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDepositResult({ success: true, message: `Redirecting you to ${gatewayInfo.name}...` });
        window.location.href = data.paymentUrl;
      } else {
        setDepositResult({
          success: false,
          error: data.error || 'Failed to initialize payment',
        });
        setIsDepositing(false);
      }
    } catch {
      setDepositResult({
        success: false,
        error: 'Network error. Please try again.',
      });
      setIsDepositing(false);
    }
  };

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reasonLabels: Record<string, string> = {
    DEPOSIT: 'Wallet Top-up',
    SMS_PURCHASE: 'SMS Purchase',
    REFUND: 'Refund',
    ADMIN_CREDIT: 'Admin Credit',
    ADMIN_DEBIT: 'Admin Debit',
    TRANSFER_IN: 'Transfer Received',
    TRANSFER_OUT: 'Transfer Sent',
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-48 rounded-xl border bg-card skeleton" />
        <div className="h-96 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your SMS credits and view transactions</p>
      </div>

      {/* Balance & Deposit */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #006B3F 0%, #004d2e 100%)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="h-8 w-8" />
            <div>
              <div className="text-sm opacity-80">Available Balance</div>
              <div className="text-4xl font-bold">GH₵{parseFloat(balance).toFixed(2)}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold">{transactions.filter(t => t.type === 'DEBIT').length}</div>
              <div className="text-xs opacity-80">SMS Sent</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold">{transactions.filter(t => t.type === 'CREDIT').length}</div>
              <div className="text-xs opacity-80">Top-ups</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10">
              <div className="text-2xl font-bold">
                GH₵{transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
              </div>
              <div className="text-xs opacity-80">Total Spent</div>
            </div>
          </div>
        </motion.div>

        {/* Deposit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5" style={{ color: '#006B3F' }} />
            <h2 className="font-semibold">Top Up Wallet</h2>
          </div>

          <AnimatePresence>
            {depositResult && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  depositResult.success ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {depositResult.success ? <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {depositResult.success ? depositResult.message : depositResult.error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Amounts */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Quick Amount (GH₵)</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    depositAmount === amt.toString()
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  GH₵{amt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
              <input
                type="number"
                min="5"
                max="50000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="input w-full pl-12"
              />
            </div>
          </div>

          {/* Active Payment Gateway (admin-controlled) */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Payment Gateway</label>
            <div
              className="flex items-center gap-3 p-4 rounded-lg border-2"
              style={{ borderColor: gatewayInfo.color, backgroundColor: `${gatewayInfo.color}0d` }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                style={{ backgroundColor: gatewayInfo.color }}
              >
                {gatewayInfo.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center gap-2">
                  {gatewayInfo.name}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: gatewayInfo.color }}
                  >
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{gatewayInfo.description}</p>
              </div>
            </div>
            {!isGatewayConfigured && (
              <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  {gatewayInfo.name} has not been configured by the administrator yet. Deposits will fail until
                  API keys are added in the Admin Panel.
                </span>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isDepositing ? 1 : 1.01 }}
            whileTap={{ scale: isDepositing ? 1 : 0.98 }}
            onClick={handleDeposit}
            disabled={!depositAmount || isDepositing}
            className="btn w-full h-11 text-white"
            style={{ backgroundColor: '#006B3F' }}
          >
            {isDepositing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Pay GH₵{depositAmount || '0'} with {gatewayInfo.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card"
      >
        <div className="p-6 border-b">
          <h2 className="font-semibold">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4">
                <div className={`p-2 rounded-full ${
                  tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {tx.type === 'CREDIT' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{reasonLabels[tx.reason] || tx.reason}</div>
                  {tx.description && (
                    <div className="text-sm text-muted-foreground">{tx.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}GH₵{parseFloat(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bal: GH₵{parseFloat(tx.balanceAfter).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
