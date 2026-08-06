'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Upload, Users, Phone, Mail, Tag, MoreVertical, Trash2, Edit } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  group?: string;
}

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Kwame Asante', phone: '+233241234567', email: 'kwame@example.com', tags: ['Customer', 'VIP'], group: 'Accra' },
    { id: '2', name: 'Ama Mensah', phone: '+233202345678', tags: ['Lead'], group: 'Kumasi' },
    { id: '3', name: 'Kofi Addo', phone: '+233261234567', email: 'kofi@example.com', tags: ['Customer'], group: 'Accra' },
    { id: '4', name: 'Abena Owusu', phone: '+233241112222', tags: ['VIP'], group: 'Takoradi' },
    { id: '5', name: 'Yaw Boateng', phone: '+233208887777', email: 'yaw@example.com', tags: ['Customer', 'Loyal'], group: 'Kumasi' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact list and groups</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: '#006B3F' }}>
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

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
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-muted-foreground">Groups</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#CE112620' }}>
              <Phone className="h-5 w-5" style={{ color: '#CE1126' }} />
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Networks</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
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
        <select className="input w-40">
          <option>All Groups</option>
          <option>Accra</option>
          <option>Kumasi</option>
          <option>Takoradi</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Group</th>
                <th className="text-left p-4 font-medium">Tags</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: '#FCD11630', color: '#000' }}>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        {contact.email && <div className="text-sm text-muted-foreground">{contact.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{contact.phone}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#006B3F20', color: '#006B3F' }}>
                      {contact.group}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-accent rounded-lg">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
