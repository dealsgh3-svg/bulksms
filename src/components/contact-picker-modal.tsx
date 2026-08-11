'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Users, Check } from 'lucide-react';

export interface PickerContact {
  id: string;
  name?: string | null;
  phone: string;
  email?: string | null;
}

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contacts: PickerContact[]) => void;
  alreadySelectedPhones?: string[];
}

export function ContactPickerModal({ isOpen, onClose, onConfirm, alreadySelectedPhones = [] }: ContactPickerModalProps) {
  const [contacts, setContacts] = useState<PickerContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContacts(data.contacts || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    setSelectedIds(new Set());
    setSearch('');
  }, [isOpen]);

  const alreadySelectedSet = useMemo(() => new Set(alreadySelectedPhones), [alreadySelectedPhones]);

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredContacts.filter((c) => !alreadySelectedSet.has(c.phone)).map((c) => c.id)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const handleConfirm = () => {
    const selected = contacts.filter((c) => selectedIds.has(c.id));
    onConfirm(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card shadow-xl max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: '#006B3F' }} />
                Select Contacts
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="input w-full pl-10"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{selectedIds.size} selected</span>
                <div className="flex gap-3">
                  <button type="button" onClick={selectAll} className="hover:underline" style={{ color: '#006B3F' }}>
                    Select all
                  </button>
                  <button type="button" onClick={deselectAll} className="hover:underline" style={{ color: '#006B3F' }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  {contacts.length === 0 ? 'No contacts yet. Add contacts first.' : 'No contacts match your search.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredContacts.map((contact) => {
                    const alreadyAdded = alreadySelectedSet.has(contact.phone);
                    const isSelected = selectedIds.has(contact.id);
                    return (
                      <label
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${alreadyAdded ? 'opacity-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={alreadyAdded}
                          onChange={() => toggle(contact.id)}
                          className="rounded"
                        />
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: '#FCD11630', color: '#000' }}
                        >
                          {(contact.name || contact.phone).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{contact.name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground">{contact.phone}</div>
                        </div>
                        {alreadyAdded && <Check className="h-4 w-4 text-muted-foreground" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="btn text-white"
                style={{ backgroundColor: '#006B3F' }}
              >
                Add {selectedIds.size > 0 ? selectedIds.size : ''} Contact{selectedIds.size === 1 ? '' : 's'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
