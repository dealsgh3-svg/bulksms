'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AdminSmsPage() {
  const smsLogs = [
    { id: '1', user: 'Kwame Asante', recipient: '+233241234567', message: 'Your order...', status: 'DELIVERED', network: 'MTN', cost: '0.05', createdAt: '2024-08-05 10:30' },
    { id: '2', user: 'Ama Mensah', recipient: '+233202345678', message: 'Payment received...', status: 'PENDING', network: 'Telecel', cost: '0.05', createdAt: '2024-08-05 10:25' },
    { id: '3', user: 'Kofi Addo', recipient: '+233261234567', message: 'Welcome...', status: 'FAILED', network: 'AT', cost: '0.05', createdAt: '2024-08-05 10:20' },
  ];

  const statusIcons = {
    DELIVERED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-600" />,
    FAILED: <XCircle className="h-4 w-4 text-red-600" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS Logs</h1>
        <p className="text-muted-foreground">Monitor all SMS activity across the platform</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Recipient</th>
              <th className="text-left p-4 font-medium">Message</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Network</th>
              <th className="text-left p-4 font-medium">Cost</th>
              <th className="text-left p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {smsLogs.map((sms) => (
              <tr key={sms.id} className="hover:bg-muted/50">
                <td className="p-4 font-medium">{sms.user}</td>
                <td className="p-4 font-mono text-sm">{sms.recipient}</td>
                <td className="p-4 text-sm text-muted-foreground truncate max-w-[200px]">{sms.message}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {statusIcons[sms.status as keyof typeof statusIcons]}
                    <span className="text-sm">{sms.status}</span>
                  </div>
                </td>
                <td className="p-4">{sms.network}</td>
                <td className="p-4">GH₵{sms.cost}</td>
                <td className="p-4 text-sm text-muted-foreground">{sms.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
