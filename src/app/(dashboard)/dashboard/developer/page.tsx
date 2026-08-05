'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Clock,
  BarChart3,
  Code,
  Book,
  Terminal,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  type: 'LIVE' | 'TEST';
  lastUsedAt?: string;
  ipWhitelist: string[];
  rateLimit: number;
  isActive: boolean;
  createdAt: string;
}

const codeExamples = {
  curl: `curl -X POST https://api.textflowpro.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "+2348012345678",
    "message": "Hello from TextFlow Pro!",
    "sender_id": "MyCompany"
  }'`,

  nodejs: `const axios = require('axios');

const response = await axios.post('https://api.textflowpro.com/v1/sms/send', {
  recipient: '+2348012345678',
  message: 'Hello from TextFlow Pro!',
  sender_id: 'MyCompany'
}, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`,

  python: `import requests

response = requests.post(
    'https://api.textflowpro.com/v1/sms/send',
    json={
        'recipient': '+2348012345678',
        'message': 'Hello from TextFlow Pro!',
        'sender_id': 'MyCompany'
    },
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)

print(response.json())`,

  php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.textflowpro.com/v1/sms/send',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'recipient' => '+2348012345678',
        'message' => 'Hello from TextFlow Pro!',
        'sender_id' => 'MyCompany'
    ]),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`,
};

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys');
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'nodejs' | 'python' | 'php'>('curl');
  const [copied, setCopied] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'LIVE' | 'TEST'>('LIVE');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Simulate loading API keys
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          keyPrefix: 'sk_live_abc1',
          type: 'LIVE',
          lastUsedAt: new Date().toISOString(),
          ipWhitelist: [],
          rateLimit: 1000,
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Test API',
          keyPrefix: 'sk_test_xyz9',
          type: 'TEST',
          ipWhitelist: [],
          rateLimit: 100,
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fakeKey = `sk_${newKeyType.toLowerCase()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    setNewKeyValue(fakeKey);
    setApiKeys([
      ...apiKeys,
      {
        id: Date.now().toString(),
        name: newKeyName,
        keyPrefix: fakeKey.slice(0, 12),
        type: newKeyType,
        ipWhitelist: [],
        rateLimit: newKeyType === 'LIVE' ? 1000 : 100,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    
    setNewKeyName('');
    setIsCreating(false);
  };

  const revokeKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== keyId));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/v1/sms/send',
      description: 'Send a single SMS message',
    },
    {
      method: 'POST',
      path: '/v1/sms/bulk',
      description: 'Send bulk SMS to multiple recipients',
    },
    {
      method: 'GET',
      path: '/v1/sms/status/:id',
      description: 'Get delivery status of a message',
    },
    {
      method: 'GET',
      path: '/v1/wallet/balance',
      description: 'Get current wallet balance',
    },
    {
      method: 'GET',
      path: '/v1/contacts',
      description: 'List all contacts',
    },
    {
      method: 'POST',
      path: '/v1/contacts',
      description: 'Create a new contact',
    },
    {
      method: 'GET',
      path: '/v1/sender-ids',
      description: 'List all sender IDs',
    },
    {
      method: 'POST',
      path: '/v1/sender-ids/request',
      description: 'Request a new sender ID',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-96 rounded-xl border bg-card skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Developer Hub</h1>
          <p className="text-muted-foreground">Manage API keys and explore our API documentation</p>
        </div>
        <button
          onClick={() => setShowNewKey(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'keys'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className="h-4 w-4" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Book className="h-4 w-4" />
            Documentation
          </button>
        </nav>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* New Key Modal */}
          {showNewKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6"
              >
                {newKeyValue ? (
                  <>
                    <h3 className="text-lg font-semibold mb-4">API Key Created</h3>
                    <div className="p-4 rounded-lg bg-muted/50 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Your API Key</span>
                        <button
                          onClick={() => copyToClipboard(newKeyValue)}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <code className="text-sm break-all">{newKeyValue}</code>
                    </div>
                    <p className="text-sm text-yellow-600 mb-4">
                      ⚠️ This is the only time you will see this key. Store it securely!
                    </p>
                    <button
                      onClick={() => { setShowNewKey(false); setNewKeyValue(''); }}
                      className="btn btn-primary w-full"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Key Name</label>
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Production API"
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Key Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="keyType"
                              value="LIVE"
                              checked={newKeyType === 'LIVE'}
                              onChange={() => setNewKeyType('LIVE')}
                              className="sr-only"
                            />
                            <div className={`px-4 py-2 rounded-lg border ${newKeyType === 'LIVE' ? 'border-primary bg-primary/5' : 'border-input'}`}>
                              <div className="font-medium">Live</div>
                              <div className="text-xs text-muted-foreground">For production use</div>
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="keyType"
                              value="TEST"
                              checked={newKeyType === 'TEST'}
                              onChange={() => setNewKeyType('TEST')}
                              className="sr-only"
                            />
                            <div className={`px-4 py-2 rounded-lg border ${newKeyType === 'TEST' ? 'border-primary bg-primary/5' : 'border-input'}`}>
                              <div className="font-medium">Test</div>
                              <div className="text-xs text-muted-foreground">For testing only</div>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowNewKey(false)}
                          className="btn btn-outline flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={createApiKey}
                          disabled={!newKeyName.trim() || isCreating}
                          className="btn btn-primary flex-1"
                        >
                          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Keys List */}
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="rounded-xl border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {key.keyPrefix}••••••••••••
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      key.type === 'LIVE' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {key.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      key.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rate Limit</div>
                    <div className="font-medium">{key.rateLimit}/min</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Used</div>
                    <div className="font-medium">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-medium">{formatDate(key.createdAt)}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button className="btn btn-outline btn-sm">
                    <RefreshCw className="h-3 w-3" />
                    Roll Key
                  </button>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="btn btn-outline btn-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-4 gap-6"
        >
          {/* Endpoints Sidebar */}
          <div className="lg:col-span-1 rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-4">Endpoints</h3>
            <div className="space-y-1">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint.path}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left"
                >
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-sm truncate">{endpoint.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Documentation Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Base URL */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Base URL</h3>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 font-mono text-sm">
                https://api.textflowpro.com
                <button
                  onClick={() => copyToClipboard('https://api.textflowpro.com')}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Authentication */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All API requests require authentication using an API key in the Authorization header.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>

            {/* Code Examples */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Code Examples</h3>
                <div className="flex gap-2">
                  {(['curl', 'nodejs', 'python', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        codeLanguage === lang ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto text-sm font-mono">
                  <code>{codeExamples[codeLanguage]}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[codeLanguage])}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-background hover:bg-accent"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Response Format */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Response Format</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All responses are returned in JSON format.
              </p>
              <div className="p-4 rounded-lg bg-muted/50 text-sm font-mono overflow-x-auto">
{`{
  "success": true,
  "message_id": "msg_abc123",
  "cost": 0.02,
  "pages": 1,
  "recipient": "+2348012345678"
}`}
              </div>
            </div>

            {/* Error Handling */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Error Handling</h3>
              <p className="text-sm text-muted-foreground mb-4">
                In case of errors, the API will return an appropriate HTTP status code and an error message.
              </p>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">400</span>
                  <span className="text-muted-foreground">Bad Request - Invalid parameters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">401</span>
                  <span className="text-muted-foreground">Unauthorized - Invalid API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">403</span>
                  <span className="text-muted-foreground">Forbidden - Insufficient permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">429</span>
                  <span className="text-muted-foreground">Too Many Requests - Rate limit exceeded</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">500</span>
                  <span className="text-muted-foreground">Internal Server Error</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
