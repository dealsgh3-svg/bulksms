'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Upload, Users, Tag, Trash2, Edit, X, Loader2,
  AlertCircle, CheckCircle2, Inbox, FileUp,
} from 'lucide-react';
import { parseContactFile } from '@/lib/contact-file-parser';

interface Contact {
  id: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  tags: string[];
  groups: { id: string; name: string }[];
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  contactCount: number;
}

const emptyForm = { name: '', phone: '', email: '', tags: '' };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [contactsRes, groupsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/groups'),
      ]);
      const contactsData = await contactsRes.json();
      const groupsData = await groupsRes.json();

      if (contactsData.success) setContacts(contactsData.contacts);
      if (groupsData.success) setGroups(groupsData.groups);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load contacts' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      const matchesGroup = groupFilter === 'all' || c.groups.some((g) => g.id === groupFilter);
      return matchesSearch && matchesGroup;
    });
  }, [contacts, searchQuery, groupFilter]);

  const networkCount = useMemo(() => {
    const networks = new Set<string>();
    contacts.forEach((c) => {
      const digits = c.phone.replace(/\D/g, '');
      const prefix = digits.slice(-9, -7);
      if (prefix) networks.add(prefix);
    });
    return networks.size || 0;
  }, [contacts]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name || '',
      phone: contact.phone,
      email: contact.email || '',
      tags: contact.tags.join(', '),
    });
    setShowModal(true);
  };

  const handleSaveContact = async () => {
    if (!form.phone.trim()) return;
    setIsSaving(true);
    setMessage(null);

    const payload = {
      name: form.name.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(editingId ? `/api/contacts/${editingId}` : '/api/contacts', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: editingId ? 'Contact updated.' : 'Contact added.' });
        setShowModal(false);
        await fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save contact' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete contact' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const parsed = await parseContactFile(file);
      if (!parsed || parsed.contacts.length === 0) {
        setMessage({ type: 'error', text: 'No valid contacts found in the file. Supported formats: .csv, .vcf' });
        return;
      }

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: parsed.contacts,
          groupName: file.name.replace(/\.(csv|vcf)$/i, ''),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `Imported ${data.imported} contact${data.imported === 1 ? '' : 's'}${data.skipped ? `, skipped ${data.skipped} duplicate/invalid` : ''}.`,
        });
        await fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to import contacts' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to parse or import the selected file.' });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 rounded-xl border bg-card skeleton" />
        <div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl border bg-card skeleton" />)}</div>
        <div className="h-64 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact list and groups</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input ref={fileInputRef} type="file" accept=".csv,.vcf" className="hidden" onChange={handleFileSelected} />
          <button onClick={handleImportClick} disabled={isImporting} className="btn btn-outline">
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import (CSV/VCF)
          </button>
          <button onClick={openAddModal} className="btn text-white" style={{ backgroundColor: '#006B3F' }}>
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#FCD11620' }}>
              <Users className="h-5 w-5" style={{ color: '#FCD116' }} />
            </div>
            <div>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <div className="text-sm text-muted-foreground">Total Contacts</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#006B3F20' }}>
              <Tag className="h-5 w-5" style={{ color: '#006B3F' }} />
            </div>
            <div>
              <div className="text-2xl font-bold">{groups.length}</div>
              <div className="text-sm text-muted-foreground">Groups</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#CE112620' }}>
              <Users className="h-5 w-5" style={{ color: '#CE1126' }} />
            </div>
            <div>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <div className="text-sm text-muted-foreground">Reachable Numbers</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="input w-full sm:w-48">
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {contacts.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No contacts yet</p>
          <p className="text-xs text-muted-foreground mb-4">Add a contact manually or import a CSV/VCF file to get started</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleImportClick} className="btn btn-outline btn-sm">
              <FileUp className="h-4 w-4" /> Import
            </button>
            <button onClick={openAddModal} className="btn text-white btn-sm" style={{ backgroundColor: '#006B3F' }}>
              <Plus className="h-4 w-4" /> Add Contact
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Phone</th>
                    <th className="text-left p-4 font-medium">Groups</th>
                    <th className="text-left p-4 font-medium">Tags</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#FCD11630', color: '#000' }}>
                            {(contact.name || contact.phone).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{contact.name || 'Unnamed'}</div>
                            {contact.email && <div className="text-sm text-muted-foreground">{contact.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{contact.phone}</td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {contact.groups.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            contact.groups.map((g) => (
                              <span key={g.id} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#006B3F20', color: '#006B3F' }}>
                                {g.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {contact.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-muted">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(contact)} className="p-2 hover:bg-accent rounded-lg">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            disabled={deletingId === contact.id}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                          >
                            {deletingId === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#FCD11630', color: '#000' }}>
                      {(contact.name || contact.phone).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{contact.name || 'Unnamed'}</div>
                      <div className="text-sm font-mono text-muted-foreground">{contact.phone}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditModal(contact)} className="p-2 hover:bg-accent rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      disabled={deletingId === contact.id}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                    >
                      {deletingId === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {(contact.groups.length > 0 || contact.tags.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {contact.groups.map((g) => (
                      <span key={g.id} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#006B3F20', color: '#006B3F' }}>{g.name}</span>
                    ))}
                    {contact.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs bg-muted">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No contacts match your filters</div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">{editingId ? 'Edit Contact' : 'Add Contact'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input w-full" placeholder="Kwame Asante" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input w-full" placeholder="+233241234567" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input w-full" placeholder="kwame@example.com" type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input w-full" placeholder="Customer, VIP" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t">
                <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button
                  onClick={handleSaveContact}
                  disabled={!form.phone.trim() || isSaving}
                  className="btn text-white"
                  style={{ backgroundColor: '#006B3F' }}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
