'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Inbox } from 'lucide-react';

interface AdminSenderId {
  id: string;
  senderId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  isDefault: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  user: { fullName: string; email: string } | null;
}

const statusColors = {
  APPROVED: { bg: '#006B3F20', text: '#006B3F' },
  PENDING: { bg: '#FCD11630', text: '#B8860B' },
  REJECTED: { bg: '#CE112620', text: '#CE1126' },
};

export default function AdminSenderIdsPage() {
  const [senderIds, setSenderIds] = useState<AdminSenderId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSenderIds = async () => {
    try {
      const res = await fetch('/api/admin/sender-ids');
      const data = await res.json();
      if (res.ok && data.success) setSenderIds(data.senderIds);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load sender IDs' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSenderIds();
  }, []);

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    setMessage(null);
    try {
      const rejectionReason = status === 'REJECTED' ? window.prompt('Reason for rejection (optional):') || 'Not approved' : undefined;
      const res = await fetch(`/api/admin/sender-ids/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Sender ID ${status.toLowerCase()}.` });
        await fetchSenderIds();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update sender ID' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><div className="h-20 rounded-xl border bg-card skeleton" /><div className="h-96 rounded-xl border bg-card skeleton" /></div>;
  }

  const pending = senderIds.filter((s) => s.status === 'PENDING');
  const reviewed = senderIds.filter((s) => s.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sender ID Requests</h1>
        <p className="text-muted-foreground">Review and approve custom Sender ID requests from users</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}
          >
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" /> Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((sid) => (
              <div key={sid.id} className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-lg">{sid.senderId}</div>
                  <div className="text-sm text-muted-foreground">
                    {sid.user?.fullName} ({sid.user?.email}) • {new Date(sid.createdAt).toLocaleDateString('en-GH')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => review(sid.id, 'APPROVED')}
                    disabled={processingId === sid.id}
                    className="btn text-white btn-sm"
                    style={{ backgroundColor: '#006B3F' }}
                  >
                    {processingId === sid.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => review(sid.id, 'REJECTED')}
                    disabled={processingId === sid.id}
                    className="btn btn-outline btn-sm text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Reviewed</h2>
        {reviewed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviewed requests yet</p>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-sm">Sender ID</th>
                  <th className="text-left p-3 font-medium text-sm">User</th>
                  <th className="text-left p-3 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviewed.map((sid) => (
                  <tr key={sid.id}>
                    <td className="p-3 font-mono text-sm">{sid.senderId}</td>
                    <td className="p-3 text-sm text-muted-foreground">{sid.user?.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: statusColors[sid.status].bg, color: statusColors[sid.status].text }}>
                        {sid.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
