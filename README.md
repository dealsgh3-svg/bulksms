<div align="center">

# 🚀 TextFlow Pro

### Enterprise-Grade Bulk SMS SaaS Platform for Ghana

**Send millions of SMS across MTN, Telecel, and AT networks — powered by Agoo SMS, secured by ACID-compliant wallets, and branded dynamically through your admin panel.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)](https://orm.drizzle.team/)
[![Agoo SMS](https://img.shields.io/badge/SMS-Agoo%20API-6366F1?style=for-the-badge)](https://agoo.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Live Demo](https://textflowpro.gh) • [API Docs](https://docs.textflowpro.gh) • [Admin Panel](https://textflowpro.gh/admin) • [Support](https://wa.me/233241234567)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Architecture](#-database-architecture)
- [Dynamic Theme Compiler](#-dynamic-theme-compiler)
- [Payment Gateways (Kora + Paystack)](#-payment-gateways-kora--paystack)
- [Upstream Provider — Agoo SMS API](#-upstream-provider--agoo-sms-api)
- [Background Jobs & Cron Workers](#-background-jobs--cron-workers)
- [Security Best Practices](#-security-best-practices)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Support](#-support)

---

## 🎯 Overview

**TextFlow Pro** is a **Ghana-first** enterprise SMS SaaS platform built for businesses that need to reach customers across all three major mobile networks — **MTN**, **Telecel**, and **AT** (formerly AirtelTigo).

Unlike generic SMS gateways, TextFlow Pro was engineered for the West African market:

| Localized Feature | Implementation |
|---|---|
| 💰 **Currency** | All transactions, wallets, and APIs use **Ghanaian Cedis (GHS / GH₵)** |
| 📱 **Networks** | Routes via Agoo SMS to MTN, Telecel, and AT with per-network delivery stats |
| 🏦 **Payments** | Kora Pay (primary) + Paystack (secondary) — both GHS-native |
| 🆔 **Sender IDs** | Supports approved Ghanaian brand names up to 11 alphanumeric characters |
| 🌍 **Timezone** | Default `Africa/Accra (GMT)` for all scheduled campaigns |
| 🇬🇭 **Phone Format** | Auto-normalizes `0XXXXXXXXX` ↔ `+233XXXXXXXXX` |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                           │
│                                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │   Landing    │    │  User        │    │   Admin      │    │   Dev        │      │
│   │    Page      │    │  Dashboard   │    │   Panel      │    │   Portal     │      │
│   │  (Next.js)   │    │   (React)    │    │   (React)    │    │   (React)    │      │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
└──────────┼───────────────────┼───────────────────┼───────────────────┼───────────────┘
           │                   │                   │                   │
           └───────────────────┴─────────┬─────────┴───────────────────┘
                                         │
┌────────────────────────────────────────┼────────────────────────────────────────────┐
│                                  API GATEWAY                                         │
│                          Next.js 14 App Router Routes                                │
│                                                                                      │
│   ┌────────────────────────────────────────────────────────────────────────────────┐ │
│   │                     Middleware Stack                                           │ │
│   │   Rate Limiter (Redis)  →  JWT Verifier  →  CORS  →  Request Logger          │ │
│   └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │   Auth   │  │   SMS    │  │  Wallet  │  │ Payments │  │  Admin   │             │
│   │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │             │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                         │
           ┌─────────────────────────────┼──────────────────────────────┐
           │                             │                              │
           ▼                             ▼                              ▼
┌─────────────────────┐     ┌─────────────────────┐        ┌─────────────────────┐
│   DATA LAYER        │     │    CACHE + QUEUE    │        │  EXTERNAL SERVICES  │
│                     │     │                     │        │                     │
│  ┌───────────────┐  │     │  ┌───────────────┐  │        │  ┌───────────────┐  │
│  │ PostgreSQL 16 │  │     │  │    Redis 7    │  │        │  │   Agoo SMS    │  │
│  │  (ACID)       │  │     │  │               │  │        │  │   Upstream    │  │
│  │               │  │     │  │  ┌──────────┐ │  │        │  │   Provider    │  │
│  │  • Users      │  │     │  │  │ BullMQ   │ │  │        │  │               │  │
│  │  • Wallets    │  │     │  │  │ Workers  │ │  │        │  │  ┌─────────┐  │  │
│  │  • Transactions│ │     │  │  │          │ │  │        │  │  │   MTN   │  │  │
│  │  • SMS Logs   │  │     │  │  │  ┌─────┐ │ │  │        │  │  │ Network │  │  │
│  │  • Payments   │  │     │  │  │  │Queue│ │ │  │        │  │  └─────────┘  │  │
│  │  • Settings   │  │     │  │  │  │     │ │ │  │        │  │  ┌─────────┐  │  │
│  │  • API Keys   │  │     │  │  │  │SMS  │ │ │  │        │  │  │ Telecel │  │  │
│  │  (SHA-256)    │  │     │  │  │  │Jobs │ │ │  │        │  │  │ Network │  │  │
│  └───────────────┘  │     │  │  └─────┘ │ │  │        │  │  └─────────┘  │  │
│                     │     │  └──────────┘ │  │        │  │  ┌─────────┐  │  │
│                     │     │               │  │        │  │  │   AT    │  │  │
│                     │     │               │  │        │  │  │ Network │  │  │
│                     │     │               │  │        │  │  └─────────┘  │  │
└─────────────────────┘     └─────────────────────┘        │  └───────────────┘  │
                                                           └─────────────────────┘
                                                                                │
                                         ┌──────────────────────────────────────┘
                                         ▼
                                ┌─────────────────────┐
                                │  PAYMENT GATEWAYS   │
                                │                     │
                                │  ┌───────────────┐  │
                                │  │   Kora Pay    │  │
                                │  │   (Default)   │  │
                                │  │   GHS Native  │  │
                                │  └───────────────┘  │
                                │  ┌───────────────┐  │
                                │  │   Paystack    │  │
                                │  │  (Secondary)  │  │
                                │  │   GHS Native  │  │
                                │  └───────────────┘  │
                                └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5 | Server components, SEO, type safety |
| **Styling** | Tailwind CSS 4, CSS Variables | Utility-first + dynamic theming |
| **Animations** | Framer Motion | Micro-interactions, page transitions |
| **Charts** | Recharts | Revenue, SMS volume, delivery analytics |
| **ORM** | Drizzle ORM | Type-safe SQL query builder |
| **Database** | PostgreSQL 16 | ACID-compliant transactions |
| **Cache & Queue** | Redis 7 | Session cache, rate limits, BullMQ backing store |
| **Jobs** | BullMQ | Distributed SMS dispatch workers |
| **Validation** | Zod | Runtime schema validation |
| **SMS Upstream** | Agoo SMS API | Ghana SMS delivery (MTN, Telecel, AT) |
| **Payments** | Kora Pay, Paystack | GHS-native payment gateways |
| **Auth** | JWT (RS256) + Argon2id passwords | Token-based sessions |

---

## 🗄️ Database Architecture

### ACID-Compliant Prepaid Wallets

Every user has a **strictly ACID-compliant wallet** backed by PostgreSQL transactions. SMS dispatches, deposits, refunds, and admin adjustments all go through a single transactional pipeline — **there is no in-memory balance cache that could drift out of sync**.

#### Preventing Double-Spending with `FOR UPDATE`

The critical path is the **send-SMS** flow. To guarantee that two concurrent requests cannot drain the same balance twice, we acquire an exclusive row-level lock on the wallet row using PostgreSQL's `FOR UPDATE`:

```sql
-- src/lib/services/wallet.ts
BEGIN TRANSACTION;

-- Acquire an exclusive lock on the wallet row.
-- Other transactions attempting to send from this wallet
-- will block here until this one commits or rolls back.
SELECT balance, id
FROM wallets
WHERE user_id = $1
FOR UPDATE;

-- Atomically verify balance >= cost AND deduct in one statement
UPDATE wallets
SET balance = balance - $cost,
    updated_at = NOW()
WHERE user_id = $1
  AND balance >= $cost
RETURNING balance;

-- If the UPDATE returned 0 rows, the balance was insufficient.
-- Rollback the entire transaction.
COMMIT; -- or ROLLBACK on failure
```

#### Drizzle ORM Implementation

```typescript
// src/lib/services/wallet.ts
import { db } from '@/db';
import { wallets, transactions } from '@/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

export async function deductSmsCost(userId: string, cost: number) {
  return db.transaction(async (tx) => {
    // Step 1: Lock the wallet row — FOR UPDATE
    const [lockedWallet] = await tx
      .select({ balance: wallets.balance, id: wallets.id })
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .for('update')       // ← row-level exclusive lock
      .limit(1);

    if (!lockedWallet) {
      throw new Error('Wallet not found');
    }

    // Step 2: Atomic balance check + deduction
    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${cost}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(wallets.userId, userId),
          gte(wallets.balance, cost.toString())  // atomic guard
        )
      )
      .returning();

    if (!updatedWallet) {
      // Balance was insufficient — throw to trigger rollback
      throw new InsufficientBalanceError(
        `Required GH₵${cost.toFixed(2)}, available GH₵${lockedWallet.balance}`
      );
    }

    // Step 3: Record the ledger entry
    await tx.insert(transactions).values({
      walletId: lockedWallet.id,
      type: 'DEBIT',
      amount: cost.toString(),
      balanceAfter: updatedWallet.balance,
      reason: 'SMS_PURCHASE',
      reference: generateReference(),
      createdAt: new Date(),
    });

    return updatedWallet;
  });
}
```

### Transaction Ledger

Every wallet movement — whether a **DEPOSIT** from Kora, a **DEBIT** for an SMS, an **ADMIN_CREDIT** from support, or a **REFUND** — is stored as an immutable row in the `transactions` table. This gives us a **complete audit trail** and lets us reconstruct the balance at any point in time.

| Reason | Type | Source |
|---|---|---|
| `DEPOSIT` | CREDIT | Kora/Paystack webhook |
| `SMS_PURCHASE` | DEBIT | SMS dispatch (single, bulk, scheduled) |
| `REFUND` | CREDIT | Failed delivery |
| `ADMIN_CREDIT` | CREDIT | Manual admin top-up (logged with `adminId`) |
| `ADMIN_DEBIT` | DEBIT | Manual admin adjustment |
| `TRANSFER_OUT` | DEBIT | Wallet-to-wallet transfer |
| `TRANSFER_IN` | CREDIT | Wallet-to-wallet transfer |

### Schema Highlights

```sql
-- Critical tables
users          (id uuid PK, email UNIQUE, whatsapp_number UNIQUE, role enum)
wallets        (id uuid PK, user_id UNIQUE FK → users, balance DECIMAL(18,6))
transactions   (id uuid PK, wallet_id FK, type enum, amount, reason enum, reference UNIQUE)
sms_logs       (id uuid PK, user_id FK, recipient, pages, cost, status enum, provider enum)
payments       (id uuid PK, user_id FK, gateway enum, amount, status enum, reference UNIQUE)
api_keys       (id uuid PK, user_id FK, key_hash VARCHAR(255), key_prefix, type enum)
sender_ids     (id uuid PK, user_id FK, sender_id VARCHAR(11), status enum)
settings       (id INT PRIMARY KEY = 1, -- singleton row for platform-wide config)
scheduled_sms  (id uuid PK, user_id FK, scheduled_for TIMESTAMPTZ, status VARCHAR)
sms_providers  (id uuid PK, code VARCHAR UNIQUE, api_key TEXT -- encrypted)
```

> **Decimal precision**: Balances and costs are stored as `DECIMAL(18,6)` to preserve GH₵ values to the stottie (1/100 GHS) and beyond, avoiding any floating-point drift.

---

## 🎨 Dynamic Theme Compiler

TextFlow Pro ships with a **fully dynamic branding engine** — the Admin Panel controls every color in the platform in real time, without redeploying.

### How It Works

```
┌──────────────────────┐      ┌───────────────────┐      ┌──────────────────────┐
│   Admin Panel        │      │  PostgreSQL       │      │   All Clients        │
│                      │      │                   │      │   (Next.js SSR)      │
│  [●] Primary Color   │─┐   │                   │      │                      │
│  [●] Secondary Color ├─┼──▶│  settings table   │─────▶│  <html style="       │
│  [●] Accent Color    │─┘   │                   │      │   --primary: #...    │
│                      │      │  (singleton row)  │      │   --secondary: #...  │
└──────────────────────┘      └───────────────────┘      │   --accent: #..."   │
                                                         │  >"                 │
                                                         └──────────────────────┘
```

1. **Admin updates color** in `/admin/settings` → Zod-validated `#RRGGBB` strings.
2. **Stored in `settings`** table singleton (`id = 1`).
3. **On every request**, a middleware fetches the current `settings` row and injects it into the root `<html>` tag as inline CSS variables.
4. **Every UI component** reads these variables via `hsl(var(--primary))`, `bg-primary`, `text-primary`, etc. — so a single DB edit rebrands the entire site instantly.

### Light Mode / Dark Mode Toggle

Theme mode (light vs dark) is managed **separately from brand colors** and is **persisted per user**:

```typescript
// src/providers/index.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"            // applies "dark" class to <html>
      defaultTheme="system"         // respects OS preference on first visit
      enableSystem                  // auto-detect system preference
      disableTransitionOnChange     // no flicker on toggle
    >
      {children}
    </NextThemesProvider>
  );
}
```

- `next-themes` writes the chosen theme (`light` / `dark` / `system`) to **`localStorage`** — so it persists across sessions and devices.
- On first load, before hydration completes, a blocking `<script>` in `<head>` reads `localStorage` and sets the `dark` class immediately — **zero FOUC** (flash of unstyled content).
- Brand colors are **identical** in both modes; only the **neutral palette** (background, foreground, muted, card, border) flips between the two `:root` definitions.

```css
:root {
  --background: 0 0% 98%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  /* brand colors injected at runtime: */
  --primary: /* from DB */;
  --secondary: /* from DB */;
  --accent: /* from DB */;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 7%;
  /* brand colors still come from DB — unchanged */
}
```

---

## 💳 Payment Gateways (Kora + Paystack)

TextFlow Pro supports **two GHS-native payment gateways**. The Admin Panel lets you toggle which is **active** and configure each independently. All prices, webhook payloads, and user-facing UI use **Ghanaian Cedis (GH₵)**.

### Gateway Configuration (Admin Panel)

| Setting | Storage | Notes |
|---|---|---|
| Active Gateway | `settings.active_payment_gateway` | Enum: `KORA` / `PAYSTACK` — **default: `KORA`** |
| Kora Secret Key | `settings.kora_secret_key` | Stored **AES-256 encrypted at rest** |
| Kora Public Key | `settings.kora_public_key` | Plain |
| Kora Webhook Secret | `settings.kora_webhook_secret` | For signature verification |
| Paystack Secret Key | `settings.paystack_secret_key` | Encrypted at rest |
| Paystack Public Key | `settings.paystack_public_key` | Plain |
| Paystack Webhook Secret | `settings.paystack_webhook_secret` | For signature verification |

### Deposit Flow

```
User clicks "Deposit GH₵50"
       │
       ▼
POST /api/wallet/deposit { amount: 50.00 }
       │
       ├─ Reads settings.active_payment_gateway
       │
       ▼
┌─────────────────────┐      ┌──────────────────────┐
│   Kora Pay API      │      │   Paystack API       │
│   (default)         │◀─OR─▶│   (secondary)        │
│                     │      │                      │
│   POST /checkout    │      │   POST /transaction  │
│   {                 │      │   {                  │
│     amount: 50.00,  │      │     amount: 5000,    │
│     currency: "GHS" │      │     currency: "GHS", │
│     reference: "..."│      │     reference: "..." │
│   }                 │      │   }                  │
└─────────┬───────────┘      └──────────┬───────────┘
          │                             │
          ▼                             ▼
  Returns checkout_url    Returns authorization_url
          │                             │
          └──────────┬──────────────────┘
                     ▼
              User completes payment
                     │
                     ▼
     Webhook → POST /api/webhooks/{gateway}
                     │
                     ▼
      Verify signature → Credit wallet
```

### Kora Pay Webhook Payload (GHS)

```json
POST /api/webhooks/kora
X-Kora-Signature: sha256=<computed_hmac>

{
  "event": "charge.completed",
  "data": {
    "reference": "DEP-1722834210-A8F3B2C1",
    "amount": 50.00,
    "currency": "GHS",
    "status": "success",
    "customer": {
      "email": "kwame@example.com",
      "name": "Kwame Mensah"
    },
    "payment_method": {
      "type": "mobile_money",
      "network": "MTN"
    }
  }
}
```

### Paystack Webhook Payload (GHS)

```json
POST /api/webhooks/paystack
X-Paystack-Signature: <computed_hmac>

{
  "event": "charge.success",
  "data": {
    "reference": "DEP-1722834210-A8F3B2C1",
    "amount": 5000,
    "currency": "GHS",
    "status": "success",
    "customer": {
      "email": "kwame@example.com"
    },
    "authorization": {
      "channel": "mobile_money",
      "brand": "MTN"
    },
    "paid_at": "2026-08-05T02:30:10.000Z"
  }
}
```

> **Note**: Paystack transmits amounts in the **smallest currency unit** (pesewas), so `GH₵50.00` → `5000`. Kora uses the **decimal form** (`50.00`). The webhook handler normalizes both to `DECIMAL(18,6)` internally.

---

## 📡 Upstream Provider — Agoo SMS API

**Agoo SMS** is the primary SMS gateway for TextFlow Pro, handling delivery across **MTN**, **Telecel**, and **AT** (AirtelTigo) networks in Ghana.

### Admin Configuration

The Agoo API Key is configured via **`/admin/providers`**. It's stored in `sms_providers.api_key` encrypted at rest.

**Two key types are supported:**

| Prefix | Purpose | Cost |
|---|---|---|
| `agoo_test_` | **Simulated delivery** — messages are accepted and tracked, but **not actually sent** to any recipient. No balance is deducted from Agoo. | GH₵0.00 |
| `agoo_live_` | **Real delivery** — messages are routed to the live networks. Balance is deducted from your Agoo GHS wallet. | Variable |

All outbound Agoo requests must pass the key in the **`X-API-Key`** header:

```http
POST /v1/sms/send HTTP/1.1
Host: api.agoo.com
X-API-Key: agoo_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

### Sender IDs vs API Keys — Critical Distinction

| Concept | Purpose | Example |
|---|---|---|
| **API Key** (`agoo_test_` / `agoo_live_`) | **Authentication** — proves who you are to Agoo. Set in Admin Panel. | `agoo_live_abc123...` |
| **Sender ID** | **Brand name** — what the recipient sees as the sender. Must be pre-approved. | `TextFlowPro`, `MTNGhana` |

> ⚠️ **Test Sender ID**: When using an `agoo_test_` key, Agoo **ignores your custom Sender ID** and forces the value `SMS_GATEWAY_USER_SENDER_ID`, and the message body is rewritten to `"Hello from Agoo"`. This lets you verify integration without wasting live funds — but means you must switch to `agoo_live_` to test real branding.

### Endpoint Mapping

| TextFlow Pro Route | Agoo Endpoint | Method | Rate Limit |
|---|---|---|---|
| `POST /api/sms/send` | `POST /v1/sms/send` | Single SMS | 60 req/min |
| `POST /api/sms/bulk` | `POST /v1/sms/send-bulk` | Bulk SMS (up to 1,000) | 10 req/min |
| `GET /api/sms/status/:id` | `GET /v1/sms/:id` | Full details | 120 req/min |
| `GET /api/sms/status/:id` (quick) | `GET /v1/sms/:id/status` | Quick status poll | 120 req/min |
| `GET /api/admin/providers/balance` | `GET /v1/balance` | Live upstream balance | 120 req/min |

### Single SMS — `POST /v1/sms/send`

**Max 480 characters / 3 segments.** Recipient in E.164 (`+233XXXXXXXXX`) or local (`0XXXXXXXXX`) format.

```http
POST /v1/sms/send
X-API-Key: agoo_live_xxx

{
  "to": "+233241234567",
  "message": "Kwame, your order #TF-8821 has been shipped. Track at tfp.gh/8821",
  "senderId": "TextFlowPro"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "msg_a1b2c3d4e5",
    "status": "PENDING",
    "to": "+233241234567",
    "senderId": "TextFlowPro",
    "segments": 2,
    "cost": 0.18,
    "currency": "GHS"
  }
}
```

### Bulk SMS — `POST /v1/sms/send-bulk`

Up to **1,000 recipients per request**.

```http
POST /v1/sms/send-bulk
X-API-Key: agoo_live_xxx

{
  "recipients": [
    "+233241234567",
    "+233201234567",
    "+233261234567"
  ],
  "message": "Reminder: your Telecel bill of GH₵50.00 is due on 10th August.",
  "senderId": "TelecelGH"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "msg_bulk_f6g7h8i9",
    "total": 3,
    "cost_per_sms": 0.09,
    "total_cost": 0.27,
    "currency": "GHS"
  }
}
```

### Status Polling

**Full details** — `GET /v1/sms/:id`:
```json
{
  "success": true,
  "data": {
    "id": "msg_a1b2c3d4e5",
    "to": "+233241234567",
    "message": "Kwame, your order #TF-8821...",
    "senderId": "TextFlowPro",
    "segments": 2,
    "cost": 0.18,
    "currency": "GHS",
    "status": "COMPLETED",
    "recipients": [
      { "phone": "+233241234567", "status": "DELIVERED", "network": "MTN", "deliveredAt": "2026-08-05T02:31:44Z" }
    ],
    "createdAt": "2026-08-05T02:30:10Z"
  }
}
```

**Quick status** — `GET /v1/sms/:id/status`:
```json
{
  "success": true,
  "data": {
    "id": "msg_a1b2c3d4e5",
    "status": "COMPLETED"
  }
}
```

**Status values**: `PENDING` → `SENDING` → `COMPLETED` | `FAILED` | `SCHEDULED`

### Upstream Balance — `GET /v1/balance`

```json
{
  "success": true,
  "data": {
    "balance": 2547.83,
    "currency": "GHS",
    "lastTopUp": "2026-07-28T09:12:00Z"
  }
}
```

### Rate Limits

Every Agoo response includes three headers:

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit` | Max requests allowed in the current window |
| `X-RateLimit-Remaining` | Requests left in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

**TextFlow Pro's rate-limit handler**:

```typescript
// src/lib/services/agoo-client.ts
async function callAgoo(endpoint: string, options: RequestInit) {
  const remaining = parseInt(
    rateLimitCache.get(endpoint)?.remaining ?? '60'
  );

  if (remaining < 5) {
    // Back off: delay the request until the window resets
    const reset = parseInt(rateLimitCache.get(endpoint)?.reset ?? '0');
    const delay = Math.max(0, reset * 1000 - Date.now());
    await sleep(delay);
  }

  const res = await fetch(`https://api.agoo.com${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'X-API-Key': settings.agooApiKey,
    },
  });

  // Update cache from response headers
  rateLimitCache.set(endpoint, {
    limit: parseInt(res.headers.get('X-RateLimit-Limit') ?? '60'),
    remaining: parseInt(res.headers.get('X-RateLimit-Remaining') ?? '60'),
    reset: parseInt(res.headers.get('X-RateLimit-Reset') ?? '0'),
  });

  return res;
}
```

### Error Handling

Agoo returns errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait 30 seconds before retrying."
  }
}
```

**TextFlow Pro maps HTTP status codes to internal actions:**

| HTTP Status | Agoo Code | Platform Action |
|---|---|---|
| `429` | `RATE_LIMIT_EXCEEDED` | Re-queue SMS job with exponential backoff (`2^attempt × 1000ms`) |
| `402` | `INSUFFICIENT_BALANCE` | Mark SMS as `FAILED`, alert admin via webhook, stop bulk job |
| `400` | `INVALID_SENDER_ID` | Return user-friendly error, suggest requesting approval in dashboard |
| `400` | `INVALID_RECIPIENT` | Return per-recipient error in bulk response |
| `401` | `INVALID_API_KEY` | Disable provider in DB, alert admin |
| `5xx` | Server error | Retry 3× with jitter, then mark as `REJECTED` |

---

## ⏰ Background Jobs & Cron Workers

TextFlow Pro uses **BullMQ** (backed by Redis) to decouple SMS dispatch, scheduled sends, and webhook retries from the HTTP request cycle.

### Queue Architecture

```
┌────────────────────┐
│   HTTP Request     │
│  (API or UI form)  │
└─────────┬──────────┘
          │ enqueue
          ▼
┌─────────────────────────────────────────────────┐
│              Redis (BullMQ)                     │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │
│  │  sms-single │  │  sms-bulk   │  │  email │ │
│  │   (queue)   │  │   (queue)   │  │ queue  │ │
│  └──────┬──────┘  └──────┬──────┘  └───┬────┘ │
│         │                │              │      │
│         ▼                ▼              ▼      │
│   ┌─────────────────────────────────────────┐  │
│   │       Delayed / Scheduled Jobs          │  │
│   │  (run at scheduled_for timestamp)       │  │
│   └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│            Worker Processes                     │
│                                                 │
│   worker-sms        worker-status     worker-   │
│   (3 concurrency)   poller (1 conc.)  webhook   │
│                     5s interval       retry     │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Agoo SMS API      │
│   (upstream)        │
└─────────────────────┘
```

### Queue Definitions

| Queue | Concurrency | Purpose |
|---|---|---|
| `sms-single` | 3 | Single SMS dispatch — calls `POST /v1/sms/send` |
| `sms-bulk` | 1 | Bulk SMS — batches up to 1,000 recipients per Agoo call |
| `sms-status-poll` | 1 | Polls Agoo every 5s for `PENDING` messages, updates DB |
| `scheduled-sms` | 3 | Processes jobs whose `scheduled_for` has passed |
| `email-notification` | 5 | Sends verification emails, delivery receipts |
| `webhook-retry` | 2 | Retries failed user-defined webhooks with exponential backoff |

### Scheduled SMS via Cron

Scheduled SMS is **not** implemented by polling the database every second. Instead, BullMQ natively supports **delayed jobs** — the job sits in Redis until its `delay` timestamp elapses.

```typescript
// src/lib/queue/scheduled-sms.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!);
const scheduledQueue = new Queue('scheduled-sms', { connection });

export async function scheduleSms({
  smsLogId,
  scheduledFor,
}: { smsLogId: string; scheduledFor: Date }) {
  const delayMs = scheduledFor.getTime() - Date.now();

  await scheduledQueue.add(
    `send-scheduled-${smsLogId}`,
    { smsLogId },
    {
      delay: Math.max(0, delayMs),
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
}
```

### Worker: Status Poller (Cron Pattern)

For messages that need near-real-time delivery status updates, a cron worker polls Agoo:

```typescript
// src/lib/workers/status-poller.ts
import { Worker, CronExpression } from 'bullmq';

const statusWorker = new Worker(
  'sms-status-poll',
  async (job) => {
    const pendingMessages = await db.query.smsLogs.findMany({
      where: eq(schema.smsLogs.status, 'SENT'),
      limit: 50,
    });

    for (const msg of pendingMessages) {
      const res = await agooClient.get(`/v1/sms/${msg.externalId}/status`);
      // Update sms_logs.status based on response
      await db.update(schema.smsLogs)
        .set({ status: mapAgooStatus(res.data.status) })
        .where(eq(schema.smsLogs.id, msg.id));
    }
  },
  { connection, limiter: { max: 1, duration: 5000 } }
);
```

### Running the Workers

```bash
# Production: run workers as separate PM2 processes
pm2 start npm --name "sms-worker"     -- start:worker:sms
pm2 start npm --name "status-worker"  -- start:worker:status
pm2 start npm --name "scheduler"      -- start:worker:scheduler
pm2 start npm --name "email-worker"   -- start:worker:email
pm2 start npm --name "webhook-worker" -- start:worker:webhook

# Or Docker Compose
docker-compose up -d sms-worker status-worker scheduler
```

### Scheduled Jobs Cleanup Cron

A separate cron runs every hour to clean up stale delayed jobs and archive completed SMS older than 90 days:

```cron
# /etc/cron.d/textflow
0 * * * *  root  /app/scripts/cleanup-stale-jobs.sh
0 3 * * *  root  /app/scripts/archive-old-sms-logs.sh
30 2 * * * root  /app/scripts/daily-revenue-report.sh
```

---

## 🔒 Security Best Practices

### 1. Double-Spend Prevention

Every wallet deduction uses a **single PostgreSQL transaction with `FOR UPDATE` row-level locking** (see [Database Architecture](#-database-architecture)). This guarantees:

- **No race conditions**: Two concurrent send requests from the same user are serialized at the DB level.
- **Atomic balance check + deduction**: The `UPDATE ... WHERE balance >= cost` pattern is a single atomic operation — there is no window where a second request can read an un-updated balance.
- **Ledger integrity**: If anything fails mid-flow, the **entire transaction rolls back** — no partial state.

### 2. API Key Cryptography

API keys are **never stored in plaintext**:

```typescript
// src/lib/services/api-keys.ts
import { createHash } from 'crypto';

function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export async function createApiKey(userId: string, name: string) {
  const rawKey = `tfp_live_${crypto.randomUUID().replace(/-/g, '')}`;
  const prefix = rawKey.slice(0, 12);          // shown in UI: "tfp_live_a1b2••••••••"
  const keyHash = hashApiKey(rawKey);          // SHA-256 of the full key

  await db.insert(schema.apiKeys).values({
    userId,
    name,
    keyHash,           // stored permanently
    keyPrefix: prefix, // stored permanently, shown to user
    type: 'LIVE',
  });

  return { key: rawKey, prefix };  // raw key returned ONCE, never stored
}

export async function authenticateApiKey(rawKey: string) {
  const candidateHash = hashApiKey(rawKey);
  return db.query.apiKeys.findFirst({
    where: eq(schema.apiKeys.keyHash, candidateHash),
  });
}
```

**Security properties**:
- Even if the DB is compromised, attackers only get **SHA-256 hashes** — not reversible.
- The raw key is shown **exactly once** at creation, so users must save it.
- The prefix (`tfp_live_a1b2`) lets users identify which key they're using without exposing the full secret.

### 3. Other Security Layers

| Concern | Mitigation |
|---|---|
| SQL Injection | Drizzle ORM uses parameterized queries exclusively — no string concatenation |
| XSS | React auto-escapes; CSP headers in `next.config.js` |
| CSRF | `SameSite=Lax` cookies + custom `X-Requested-With` header validation |
| Rate Limiting | Redis sliding-window counters — 100 req/min per IP, 5 login attempts/min |
| Password Storage | Argon2id (memory-hard, 64MB, 3 iterations) |
| JWT Tokens | Access: 15-min HS256. Refresh: 7-day, rotated on use, revocable |
| Webhook Signatures | HMAC-SHA256 verification for both Kora and Paystack |
| Secrets at Rest | `settings.kora_secret_key`, `sms_providers.api_key` encrypted with AES-256-GCM, key from `ENCRYPTION_KEY` env var |
| IP Whitelisting | API keys can be restricted to specific IPs — enforced at middleware |

---

## 📡 API Reference

### Base URL

```
https://api.textflowpro.gh/v1
```

### Authentication (User API)

```http
Authorization: Bearer tfp_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/sms/send` | Send single SMS | User |
| `POST` | `/sms/bulk` | Bulk SMS (up to 1,000) | User |
| `GET` | `/sms/:id` | Get SMS details | User |
| `GET` | `/sms/:id/status` | Poll delivery status | User |
| `GET` | `/wallet/balance` | Current balance (GHS) | User |
| `GET` | `/wallet/transactions` | Transaction history | User |
| `POST` | `/sender-ids/request` | Request new sender ID | User |
| `GET` | `/contacts` | List contacts | User |
| `POST` | `/contacts/import` | Bulk import CSV | User |

### Example: Send Single SMS

```bash
curl -X POST https://api.textflowpro.gh/v1/sms/send \
  -H "Authorization: Bearer tfp_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "+233241234567",
    "message": "Akwasi, your order is on the way!",
    "senderId": "MyShop"
  }'
```

**Response** (GHS):
```json
{
  "success": true,
  "messageId": "msg_xxxxxxxxx",
  "cost": 0.18,
  "pages": 2,
  "recipient": "+233241234567",
  "currency": "GHS"
}
```

### Code Samples

<details>
<summary><strong>Node.js (axios)</strong></summary>

```javascript
const axios = require('axios');

const res = await axios.post(
  'https://api.textflowpro.gh/v1/sms/send',
  {
    recipient: '+233241234567',
    message: 'Ama, your balance is GH₵50.00. Pay via MTN MoMo.',
    senderId: 'MyShop',
  },
  { headers: { Authorization: 'Bearer tfp_live_xxx' } }
);

console.log(`Cost: GH₵${res.data.cost}`);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
import requests

res = requests.post(
    'https://api.textflowpro.gh/v1/sms/send',
    json={
        'recipient': '+233241234567',
        'message': 'Kofi, your GH₵50.00 bill is due.',
        'senderId': 'MyShop',
    },
    headers={'Authorization': 'Bearer tfp_live_xxx'},
)

print(f"Cost: GH₵{res.json()['cost']}")
```
</details>

<details>
<summary><strong>PHP (cURL)</strong></summary>

```php
<?php
$ch = curl_init('https://api.textflowpro.gh/v1/sms/send');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer tfp_live_xxx',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'recipient' => '+233241234567',
        'message' => 'Yaw, your package has arrived.',
        'senderId' => 'MyShop',
    ]),
]);
$response = curl_exec($ch);
$data = json_decode($response, true);
echo "Cost: GH₵{$data['cost']}";
```
</details>

<details>
<summary><strong>Laravel (Guzzle)</strong></summary>

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Authorization' => 'Bearer tfp_live_xxx',
])->post('https://api.textflowpro.gh/v1/sms/send', [
    'recipient' => '+233241234567',
    'message' => 'Adjoa, your GH₵50.00 is ready for pickup.',
    'senderId' => 'MyShop',
]);

$info = $response->json();
Log::info("Cost: GH₵{$info['cost']}");
```
</details>

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Connect repo to vercel.com
# 2. Add environment variables (see .env.example)
# 3. Deploy
vercel --prod
```

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.9'
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: textflow
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: textflow_prod
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes: ["redisdata:/data"]

  sms-worker:
    build: .
    command: node dist/workers/sms.js
    env_file: .env
    depends_on: [redis, postgres]

  status-worker:
    build: .
    command: node dist/workers/status-poller.js
    env_file: .env
    depends_on: [redis, postgres]

volumes:
  pgdata:
  redisdata:
```

### PM2 (VPS)

```bash
# Install PM2
npm install -g pm2

# Start app + workers
pm2 start npm --name "textflow-web"  -- start
pm2 start npm --name "textflow-sms"  -- start:worker:sms
pm2 start npm --name "textflow-status" -- start:worker:status
pm2 start npm --name "textflow-scheduler" -- start:worker:scheduler

# Save & auto-restart on boot
pm2 save
pm2 startup
```

### Environment Variables (`.env.example`)

```env
# Application
NODE_ENV=production
APP_URL=https://textflowpro.gh
APP_NAME="TextFlow Pro"

# Database
DATABASE_URL=postgresql://textflow:${POSTGRES_PASSWORD}@localhost:5432/textflow_prod

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379

# Auth
JWT_SECRET=replace-with-64-char-random-string
JWT_REFRESH_SECRET=replace-with-another-64-char-random-string

# Agoo SMS (primary upstream)
AGOO_API_KEY=agoo_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Payment Gateways
KORA_SECRET_KEY=sk_live_xxx
KORA_PUBLIC_KEY=pk_live_xxx
KORA_WEBHOOK_SECRET=whsec_xxx

PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# Encryption
ENCRYPTION_KEY=32-char-random-string-for-encrypting-keys-at-rest
```

---

## 🤝 Support

- 📖 **Docs**: [docs.textflowpro.gh](https://docs.textflowpro.gh)
- 💬 **WhatsApp**: [+233 24 123 4567](https://wa.me/233241234567)
- 📧 **Email**: [support@textflowpro.gh](mailto:support@textflowpro.gh)
- 🐛 **Issues**: [github.com/textflowpro/issues](https://github.com/textflowpro/issues)
- 🇬🇭 **Address**: 14 Independence Ave, Accra, Ghana

---

<div align="center">

**Built with ❤️ in Accra, Ghana 🇬🇭**

TextFlow Pro · © 2026 · MIT License

</div>
