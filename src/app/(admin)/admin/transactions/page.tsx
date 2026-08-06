'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

export default function AdminTransactionsPage() {
  const transactions = [
    { id: '1', user: 'Kwame Asante', type: 'CREDIT', amount: '100.00', reason: 'DEPOSIT', method: 'MTN MoMo', status: 'COMPLETED', createdAt: '2024-08-05 10:30' },
    { id: '2', user: 'Ama Mensah', type: 'DEBIT', amount: '25.00', reason: 'SMS_PURCHASE', method: '-', status: 'COMPLETED', createdAt: '2024-08-05 10:15' },
    { id: '3', user: 'Kofi Addo', type: 'CREDIT', amount: '500.00', reason: 'DEPOSIT', method: 'Bank Transfer', status: 'PENDING', createdAt: '2024-08-05 09:45' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Monitor all wallet transactions</p>
        </div>
        <button className="btn btn-outline">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Amount</th>
              <th className="text-left p-4 font-medium">Reason</th>
              <th className="text-left p-4 font-medium">Method</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/50">
                <td className="p-4 font-medium">{tx.user}</td>
                <td className="p-4">
                  <div className={`p-2 rounded-full w-fit ${
                    tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.type === 'CREDIT' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                </td>
                <td className="p-4 font-bold">GH₵{tx.amount}</td>
                <td className="p-4">{tx.reason}</td>
                <td className="p-4">{tx.method}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{tx.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
