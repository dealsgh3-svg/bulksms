'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, UserCheck, UserX, Wallet } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  balance: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users] = useState<User[]>([
    { id: '1', fullName: 'Kwame Asante', email: 'kwame@example.com', phone: '+233241234567', role: 'USER', balance: '150.00', status: 'ACTIVE', createdAt: '2024-01-15' },
    { id: '2', fullName: 'Ama Mensah', email: 'ama@example.com', phone: '+233202345678', role: 'AGENT', balance: '2500.00', status: 'ACTIVE', createdAt: '2024-02-20' },
    { id: '3', fullName: 'Kofi Addo', email: 'kofi@example.com', phone: '+233261234567', role: 'DEVELOPER', balance: '500.00', status: 'ACTIVE', createdAt: '2024-03-10' },
    { id: '4', fullName: 'Abena Owusu', email: 'abena@example.com', phone: '+233241112222', role: 'USER', balance: '0.00', status: 'SUSPENDED', createdAt: '2024-04-05' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColors = {
    USER: { bg: '#006B3F20', text: '#006B3F' },
    AGENT: { bg: '#FCD11630', text: '#000' },
    DEVELOPER: { bg: '#CE112620', text: '#CE1126' },
    ADMIN: { bg: '#00000020', text: '#000' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Balance</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
                        style={{ backgroundColor: '#006B3F' }}
                      >
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: roleColors[user.role].bg,
                        color: roleColors[user.role].text 
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 font-medium">GH₵{user.balance}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-accent rounded-lg" title="Edit">
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-lg" title="Adjust Balance">
                        <Wallet className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg" title="Suspend">
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
