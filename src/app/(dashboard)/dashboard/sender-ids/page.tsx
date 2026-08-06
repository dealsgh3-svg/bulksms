'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SenderId {
  id: string;
  senderId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  isDefault: boolean;
  createdAt: string;
  rejectionReason?: string;
}

export default function SenderIdsPage() {
  const [senderIds] = useState<SenderId[]>([
    { id: '1', senderId: 'MyShopGH', status: 'APPROVED', isDefault: true, createdAt: '2024-01-15' },
    { id: '2', senderId: 'KenteStyles', status: 'PENDING', isDefault: false, createdAt: '2024-08-01' },
    { id: '3', senderId: 'ACCRA2024', status: 'REJECTED', isDefault: false, createdAt: '2024-07-20', rejectionReason: 'Sender ID too generic' },
  ]);
  const [newSenderId, setNewSenderId] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sender IDs</h1>
          <p className="text-muted-foreground">Manage your branded sender names for SMS</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          style={{ backgroundColor: '#006B3F' }}
        >
          <Plus className="h-4 w-4" />
          Request Sender ID
        </button>
      </div>

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
              A Sender ID is the name that appears as the sender of your SMS. In Ghana, Sender IDs must be 
              3-11 characters and approved by the NCA. Custom Sender IDs help build brand recognition 
              and trust with your customers across MTN, Telecel, and AT networks.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Request Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Request New Sender ID</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sender ID Name</label>
              <input
                type="text"
                value={newSenderId}
                onChange={(e) => setNewSenderId(e.target.value.toUpperCase())}
                placeholder="e.g., KENTEFASHION"
                maxLength={11}
                className="input w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                3-11 alphanumeric characters. No spaces or special characters.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                style={{ backgroundColor: '#006B3F' }}
                disabled={newSenderId.length < 3}
              >
                Submit Request
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sender IDs List */}
      <div className="grid gap-4">
        {senderIds.map((sid) => (
          <motion.div 
            key={sid.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: statusColors[sid.status].bg }}
                >
                  {statusIcons[sid.status]}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold font-mono">{sid.senderId}</h3>
                    {sid.isDefault && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: '#006B3F', color: '#fff' }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Requested: {sid.createdAt}</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: statusColors[sid.status].bg,
                        color: statusColors[sid.status].text 
                      }}
                    >
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
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#006B3F', color: '#006B3F' }}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="font-semibold mb-4">NCA Guidelines for Ghana</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Sender IDs must be between 3 and 11 characters</li>
          <li>• Only alphanumeric characters allowed (A-Z, 0-9)</li>
          <li>• No spaces, hyphens, or special characters</li>
          <li>• Cannot impersonate government agencies or banks</li>
          <li>• Approval typically takes 1-3 business days</li>
          <li>• Each Sender ID costs GH₵50.00 for registration</li>
        </ul>
      </div>
    </div>
  );
}
