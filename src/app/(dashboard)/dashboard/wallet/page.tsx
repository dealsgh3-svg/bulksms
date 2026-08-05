'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Clock, Check, Loader2, AlertCircle } from 'lucide-react';

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

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  fee: number;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'KORA', name: 'Kora Pay', logo: '/kora.svg', fee: 0 },
  { id: 'PAYSTACK', name: 'Paystack', logo: '/paystack.svg', fee: 0 },
];

export default function WalletPage() {
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('KORA');
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

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 1) {
      setDepositResult({ success: false, error: 'Minimum deposit is $1' });
      return;
    }

    setIsDepositing(true);
    setDepositResult(null);

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          gateway: selectedGateway,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      } else {
        setDepositResult({
          success: false,
          error: data.error || 'Failed to initialize payment',
        });
      }
    } catch {
      setDepositResult({
        success: false,
        error: 'Network error. Please try again.',
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reasonLabels: Record<string, string> = {
    DEPOSIT: 'Wallet Deposit',
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
          className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="h-8 w-8" />
            <div>
              <div className="text-sm opacity-80">Available Balance</div>
              <div className="text-4xl font-bold">${parseFloat(balance).toFixed(2)}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{transactions.filter(t => t.type === 'DEBIT').length}</div>
              <div className="text-xs opacity-80">SMS Sent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{transactions.filter(t => t.type === 'CREDIT').length}</div>
              <div className="text-xs opacity-80">Deposits</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                ${transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
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
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Top Up Wallet</h2>
          </div>

          {depositResult && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              depositResult.success ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
            }`}>
              {depositResult.success ? depositResult.message : depositResult.error}
            </div>
          )}

          {/* Quick Amounts */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Quick Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    depositAmount === amt.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                min="1"
                max="10000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="input w-full pl-8"
              />
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGateway === method.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="radio"
                    name="gateway"
                    value={method.id}
                    checked={selectedGateway === method.id}
                    onChange={() => setSelectedGateway(method.id)}
                    className="sr-only"
                  />
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedGateway === method.id ? 'border-primary' : 'border-muted'
                  }`}>
                    {selectedGateway === method.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="font-medium">{method.name}</span>
                  {method.fee > 0 && (
                    <span className="text-xs text-muted-foreground">({method.fee}% fee)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={!depositAmount || isDepositing}
            className="btn btn-primary w-full h-11"
          >
            {isDepositing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Deposit ${depositAmount || '0'}
              </>
            )}
          </button>
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
                    {tx.type === 'CREDIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bal: ${parseFloat(tx.balanceAfter).toFixed(2)}
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
