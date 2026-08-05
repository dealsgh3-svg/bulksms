'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Step = 'upload' | 'preview' | 'confirm';

interface Recipient {
  phone: string;
  name?: string;
  selected: boolean;
}

export default function BulkSmsPage() {
  const [step, setStep] = useState<Step>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [phoneColumn, setPhoneColumn] = useState<number>(0);
  const [nameColumn, setNameColumn] = useState<number>(-1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [deduplicate, setDeduplicate] = useState(true);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setResult({ success: false, error: 'Please upload a CSV or Excel file' });
      return;
    }

    setFile(file);
    
    // Parse file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        setResult({ success: false, error: 'File must have at least a header row and one data row' });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataRows = lines.slice(1).map(row =>
        row.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );

      setHeaders(headers);
      setRows(dataRows);
      
      // Auto-detect phone column
      const phoneIdx = headers.findIndex(h => 
        /phone|mobile|tel|cell/i.test(h)
      );
      setPhoneColumn(phoneIdx >= 0 ? phoneIdx : 0);
      
      const nameIdx = headers.findIndex(h => 
        /name|first|last/i.test(h)
      );
      setNameColumn(nameIdx >= 0 ? nameIdx : -1);
    };
    reader.readAsText(file);
  };

  const processRecipients = () => {
    const processed: Recipient[] = [];
    const seen = new Set<string>();

    rows.forEach(row => {
      let phone = row[phoneColumn] || '';
      // Normalize phone number
      phone = phone.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '+234' + phone.slice(1);
      if (!phone.startsWith('+')) phone = '+' + phone;

      if (deduplicate && seen.has(phone)) return;
      seen.add(phone);

      processed.push({
        phone,
        name: nameColumn >= 0 ? row[nameColumn] : undefined,
        selected: true,
      });
    });

    setRecipients(processed);
  };

  const calculateCost = () => {
    const gsm7Chars = message.match(/^[A-Za-z0-9\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/);
    const isUnicode = !gsm7Chars && /[^\x00-\x7F]/.test(message);
    const charsPerPage = isUnicode ? 70 : 160;
    const pages = Math.ceil(message.length / charsPerPage) || 1;
    const selectedCount = recipients.filter(r => r.selected).length;
    const rate = 0.02; // USER rate
    return {
      pages,
      charsPerPage,
      isUnicode,
      selectedCount,
      totalCost: pages * selectedCount * rate,
      rate,
    };
  };

  const costPreview = calculateCost();

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/sms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.filter(r => r.selected).map(r => r.phone),
          message,
          senderId: senderId || undefined,
          scheduleAt: scheduleDate || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `Successfully queued ${data.count} messages for delivery.`,
        });
        setStep('upload');
        setFile(null);
        setRows([]);
        setRecipients([]);
        setMessage('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to send messages',
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecipient = (index: number) => {
    setRecipients(prev =>
      prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r)
    );
  };

  const selectAll = () => {
    setRecipients(prev => prev.map(r => ({ ...r, selected: true })));
  };

  const deselectAll = () => {
    setRecipients(prev => prev.map(r => ({ ...r, selected: false })));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bulk SMS</h1>
        <p className="text-muted-foreground">Send messages to multiple recipients at once</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4">
        {(['upload', 'preview', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === s ? 'bg-primary text-primary-foreground' :
              (i < ['upload', 'preview', 'confirm'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-muted')
            }`}>
              {i < ['upload', 'preview', 'confirm'].indexOf(step) ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium capitalize ${step === s ? '' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
          </div>
        ))}
      </div>

      {/* Result Alert */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            result.success ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{result.success ? result.message : result.error}</span>
          </div>
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-medium mb-2">
                Drop your file here or click to upload
              </div>
              <div className="text-sm text-muted-foreground">
                Supports CSV, XLSX, XLS files
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {rows.length} recipients detected
                  </div>
                </div>
                <button onClick={() => { setFile(null); setRows([]); }} className="p-2 hover:bg-accent rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {rows.length > 0 && (
              <div className="flex justify-end">
                <button onClick={() => { processRecipients(); setStep('preview'); }} className="btn btn-primary">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Column Mapping */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <label className="text-sm font-medium mb-2 block">Phone Number Column *</label>
                <select
                  value={phoneColumn}
                  onChange={(e) => setPhoneColumn(parseInt(e.target.value))}
                  className="input w-full"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <label className="text-sm font-medium mb-2">Name Column (optional)</label>
                <select
                  value={nameColumn}
                  onChange={(e) => setNameColumn(parseInt(e.target.value))}
                  className="input w-full"
                >
                  <option value={-1}>None</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deduplication */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="dedup"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="dedup" className="text-sm">Remove duplicate phone numbers</label>
            </div>

            {/* Recipients List */}
            <div className="rounded-lg border">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {recipients.filter(r => r.selected).length} of {recipients.length} selected
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <button onClick={selectAll} className="text-sm text-primary hover:underline">Select all</button>
                  <span className="text-muted-foreground">•</span>
                  <button onClick={deselectAll} className="text-sm text-primary hover:underline">Deselect all</button>
                </div>
                <button
                  onClick={() => { processRecipients(); }}
                  className="text-sm text-primary hover:underline"
                >
                  Re-process
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y">
                {recipients.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={r.selected}
                      onChange={() => toggleRecipient(i)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{r.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep('upload')} className="btn btn-outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={recipients.filter(r => r.selected).length === 0}
                className="btn btn-primary"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Message & Options */}
            <div className="rounded-xl border bg-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="input w-full resize-none"
                  placeholder="Type your message..."
                  required
                />
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>{message.length} chars</span>
                  <span>{costPreview.pages} page(s)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sender ID (optional)</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="MyCompany"
                    maxLength={11}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule (optional)</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="rounded-xl border bg-muted/50 p-6">
              <h3 className="font-semibold mb-4">Cost Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span>{costPreview.selectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages per message</span>
                  <span>{costPreview.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate per page</span>
                  <span>${costPreview.rate.toFixed(3)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Cost</span>
                  <span className="text-primary text-lg">${costPreview.totalCost.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep('preview')} className="btn btn-outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message || isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : scheduleDate ? (
                  'Schedule Messages'
                ) : (
                  'Send Messages'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
