'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Star, Inbox } from 'lucide-react';

interface SenderId {
  id: string;
  senderId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  isDefault: boolean;
  createdAt: string;
  rejectionReason?: string | null;
}

const statusIcons = {
  APPROVED: <CheckCircle2 className="h-5 w-5" style={{ color: '#006B3F' }} />,
  PENDING: <Clock className="h-5 w-5 text-yellow-500" />,
  REJECTED: <XCircle className="h-5 w-5" style={{ color: '#CE1126' }} />,
};

const statusColors = {
  APPROVED: { bg: '#006B3F20', text: '#006B3F' },
  PENDING: { bg: '#FCD11630', text: '#B8860B' },
  REJECTED: { bg: '#CE112620', text: '#CE1126' },
};

export default function SenderIdsPage() {
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSenderId, setNewSenderId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSenderIds = async () => {
    try {
      const res = await fetch('/api/sender-ids');
      const data = await res.json();
      if (res.ok && data.success) {
        setSenderIds(data.senderIds);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load sender IDs' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while loading sender IDs' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSenderIds();
  }, []);

  const handleSubmit = async () => {
    if (newSenderId.length < 3) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/sender-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: newSenderId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Sender ID "${data.senderId.senderId}" submitted for approval.` });
        setNewSenderId('');
        setShowForm(false);
        await fetchSenderIds();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit sender ID request' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/sender-ids/${id}/default`, { method: 'PATCH' });
      const data = await res.json();

      if (res.ok && data.success) {
        await fetchSenderIds();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to set default sender ID' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sender IDs</h1>
          <p className="text-muted-foreground">Manage your branded sender names for SMS</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setMessage(null); }}
          className="btn btn-primary"
          style={{ backgroundColor: '#006B3F' }}
        >
          <Plus className="h-4 w-4" />
          Request Sender ID
        </button>
      </div>

      {/* Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6"
        style={{ backgroundColor: '#FCD11615', borderColor: '#FCD11650' }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#FCD11630' }}>
            <Shield className="h-5 w-5" style={{ color: '#000' }} />
          </div>
          <div>
            <h3 className="font-semibold mb-1">About Sender IDs</h3>
            <p className="text-sm text-muted-foreground">
              A Sender ID is the name that appears as the sender of your SMS. Custom Sender IDs must be reviewed
              and approved by an administrator before use. Until approved, your messages will send using the
              platform&apos;s default test sender name.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border bg-card p-6 overflow-hidden"
          >
            <h3 className="font-semibold mb-4">Request New Sender ID</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sender ID Name</label>
                <input
                  type="text"
                  value={newSenderId}
                  onChange={(e) => setNewSenderId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g., KENTEFASHION"
                  maxLength={11}
                  className="input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-11 alphanumeric characters. No spaces or special characters.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#006B3F' }}
                  disabled={newSenderId.length < 3 || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit Request
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sender IDs List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-xl border bg-card skeleton" />)}
        </div>
      ) : senderIds.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No Sender IDs requested yet</p>
          <p className="text-xs text-muted-foreground">Request your first branded Sender ID above</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {senderIds.map((sid) => (
            <motion.div
              key={sid.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: statusColors[sid.status].bg }}>
                    {statusIcons[sid.status]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold font-mono">{sid.senderId}</h3>
                      {sid.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#006B3F', color: '#fff' }}>
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span>Requested: {new Date(sid.createdAt).toLocaleDateString('en-GH')}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: statusColors[sid.status].bg, color: statusColors[sid.status].text }}>
                        {sid.status}
                      </span>
                    </div>
                    {sid.rejectionReason && (
                      <p className="text-sm mt-2" style={{ color: '#CE1126' }}>
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {sid.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {sid.status === 'APPROVED' && !sid.isDefault && (
                    <button
                      onClick={() => handleSetDefault(sid.id)}
                      disabled={settingDefaultId === sid.id}
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: '#006B3F', color: '#006B3F' }}
                    >
                      {settingDefaultId === sid.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Guidelines */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="font-semibold mb-4">Sender ID Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Sender IDs must be between 3 and 11 characters</li>
          <li>• Only alphanumeric characters allowed (A-Z, 0-9)</li>
          <li>• No spaces, hyphens, or special characters</li>
          <li>• Cannot impersonate government agencies or banks</li>
          <li>• An administrator must review and approve each request</li>
        </ul>
      </div>
    </div>
  );
}
