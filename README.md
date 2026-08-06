# 🚀 TextFlow Pro

### Enterprise-Grade Bulk SMS SaaS Platform for Ghana

**Send millions of SMS across MTN, Telecel, and AT networks — powered by prepaid wallets, secured by ACID-compliant transactions, and branded with authentic Ghanaian colors.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🇬🇭 Ghana-First Platform

TextFlow Pro is built specifically for Ghanaian businesses:

| Feature | Implementation |
|---------|---------------|
| **Currency** | Ghana Cedis (GH₵) - All prices, wallets, and transactions |
| **Networks** | MTN, Telecel, and AT (AirtelTigo) support |
| **Payments** | MTN MoMo, Telecel Cash, Bank Transfer |
| **Phone Format** | Auto-formats 0XXXXXXXXX ↔ +233XXXXXXXXX |
| **Pricing** | Pay-as-you-go, no subscriptions |
| **Theme** | Ghana flag colors (Green, Gold, Red) |

---

## ✨ Key Features

- **💰 Prepaid Wallet System** - Top up with Mobile Money or bank transfer, pay only for what you send
- **📱 All Ghana Networks** - Send to MTN, Telecel, and AT subscribers
- **🏢 Admin Dashboard** - Full platform management with role-based access
- **📊 Real-time Analytics** - Track deliveries, costs, and network performance
- **🔌 Developer API** - REST API with Ghana-focused documentation
- **🎨 Ghanaian Branding** - Authentic colors and local context
- **🔒 Secure** - ACID-compliant transactions, JWT auth, encrypted secrets

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Drizzle ORM |
| **Database** | PostgreSQL 16 (ACID-compliant) |
| **Cache/Queue** | Redis 7, BullMQ |
| **Authentication** | JWT (RS256), Argon2id passwords |
| **Payments** | MTN MoMo, Telecel Cash, Bank Transfer |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   React 18 + Next.js 14 App Router + Tailwind CSS           │
│   Ghana Theme (Green #006B3F, Gold #FCD116, Red #CE1126)    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│              Next.js API Routes + Middleware                 │
│   Rate Limiting → JWT Auth → Validation → Controller        │
└────────────────────────┬────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐        ┌─────▼─────┐       ┌──────▼──────┐
│PostgreSQL│        │  Redis 7  │       │Payment APIs │
│  16     │        │           │       │  MTN MoMo   │
│         │        │ • Sessions│       │ Telecel Cash│
│• Users  │        │ • Cache   │       │ Bank Transfer│
│• Wallets│        │ • Queues  │       └─────────────┘
│• SMS Logs│        └───────────┘
│• Transactions     ┌───────────┐
│• Settings         │ BullMQ    │
└─────────┘         │ Workers   │
                    │ • SMS     │
                    │ • Scheduled│
                    └───────────┘
```

---

## 💰 Ghana Cedi (GH₵) Currency

All monetary values in the platform use **Ghana Cedis (GHS/GH₵)**:

- Wallet balances display as `GH₵150.00`
- SMS pricing in GH₵ per message
- Transaction history in GH₵
- Deposit amounts in GH₵
- API responses return `currency: "GHS"`

### Pricing Tiers (GH₵/SMS)

| Role | Price | Description |
|------|-------|-------------|
| Regular User | GH₵0.05 | Standard pay-as-you-go |
| Agent | GH₵0.04 | Volume discount |
| Developer | GH₵0.035 | API high-volume rate |

---

## 🎨 Ghanaian Theme & Branding

The platform uses authentic Ghana flag colors:

```css
/* Ghana Flag Colors */
--ghana-green:   #006B3F;  /* Primary actions, success */
--ghana-gold:    #FCD116;  /* Secondary highlights, accents */
--ghana-red:     #CE1126;  /* Destructive, admin panel */
--ghana-black:   #000000;  /* Text, contrast */
```

### Theme Application
- **Primary Green (#006B3F)**: Buttons, active states, success indicators, wallet cards
- **Gold (#FCD116)**: Secondary buttons, highlights, tips boxes, accents
- **Red (#CE1126)**: Admin panel, destructive actions, errors
- **Black**: Text, borders, contrast elements

---

## 📱 Ghana Phone Number Formatting

Phone numbers are automatically normalized to Ghana format:

```typescript
// Input → Output
"0241234567"    → "+233241234567"
"+233241234567" → "+233241234567"
"233241234567"  → "+233241234567"
```

All SMS APIs expect E.164 format (`+233XXXXXXXXX`).

---

## 💳 Payment Methods (Ghana)

Users can top up wallets using:

1. **MTN Mobile Money** - Most popular, instant
2. **Telecel Cash** - Instant mobile money
3. **Bank Transfer** - 1-2 business days

### No Subscriptions

Unlike international competitors, TextFlow Pro is **strictly pay-as-you-go**:
- ❌ No monthly fees
- ❌ No subscription plans
- ❌ No "free trial" periods
- ✅ Pay only for SMS you actually send
- ✅ Top up when you need to
- ✅ Wallet balance never expires

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/textflow-pro.git
cd textflow-pro

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database and Redis credentials

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/textflow

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Ghana Payment Config
PAYMENT_PROVIDER=momo
MOMO_API_KEY=your-momo-api-key
MOMO_API_SECRET=your-momo-secret
```

---

## 🔑 Demo Login Credentials

The database ships with two pre-seeded accounts. Run the seed script to create them:

```bash
npx tsx scripts/seed.ts
```

Then log in with either account (there are also quick-fill buttons on the login page):

| Account | Email | Password | Access |
|---------|-------|----------|--------|
| 👤 **Demo User** | `demo@textflowpro.gh` | `Demo1234` | Standard dashboard, GH₵250 wallet |
| 🛡️ **Admin** | `admin@textflowpro.gh` | `Admin1234` | Full admin panel + dashboard |

> **Note:** The admin role is stored in the database `users.role` column. To promote any account to admin manually (e.g. in Supabase), run:
> ```sql
> UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
> ```

---

## 🌓 Light & Dark Mode

TextFlow Pro includes a fully persistent light/dark theme system powered by `next-themes`:

- **Toggle everywhere** — Theme switch is available in the landing nav, auth pages, dashboard top bar, admin top bar, and user Settings → Appearance.
- **Persistent** — Your preference is saved to `localStorage` and survives reloads.
- **System aware** — Defaults to your OS preference on first visit.
- **No flash** — Theme is applied before hydration to prevent flicker (FOUC).

---

## 🔐 Route Protection

A Next.js `middleware.ts` guards all protected routes:

- `/dashboard/*` and `/admin/*` require a valid auth cookie — unauthenticated visitors are redirected to `/login?redirect=...`
- Logged-in users visiting `/login` or `/register` are redirected to `/dashboard`
- The admin layout additionally verifies the `ADMIN` role client-side

---

## ✨ Interactive UI

The interface uses Framer Motion throughout for a lively feel:

- Animated page transitions between dashboard routes
- Animated number counters on stat cards
- Hover lift & scale effects on cards and buttons
- Sliding active-nav indicator in the sidebar
- Floating decorative shapes on auth pages
- Staggered reveal animations on lists and grids

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/      # User dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   ├── contacts/page.tsx  # Contact management
│   │   │   ├── sender-ids/page.tsx # Sender ID requests
│   │   │   ├── analytics/page.tsx # User analytics
│   │   │   ├── settings/page.tsx  # User settings
│   │   │   ├── wallet/page.tsx    # Wallet & transactions
│   │   │   ├── sms/page.tsx       # Send single SMS
│   │   │   ├── sms/bulk/page.tsx  # Bulk SMS upload
│   │   │   └── developer/page.tsx # API keys & docs
│   │   └── layout.tsx
│   ├── (admin)/          # Admin panel
│   │   ├── admin/
│   │   │   ├── page.tsx           # Admin overview
│   │   │   ├── users/page.tsx     # User management
│   │   │   ├── transactions/page.tsx # All transactions
│   │   │   ├── sms/page.tsx       # All SMS logs
│   │   │   ├── analytics/page.tsx # Platform analytics
│   │   │   ├── pricing/page.tsx   # Pricing management
│   │   │   ├── providers/page.tsx # SMS providers
│   │   │   └── settings/page.tsx  # Platform settings
│   │   └── layout.tsx
│   ├── api/              # API routes
│   ├── page.tsx          # Landing page
│   └── layout.tsx
├── components/
│   ├── theme-toggle.tsx      # Light/dark toggle & switch
│   └── animated-counter.tsx  # Animated number counter
├── db/
│   ├── schema.ts         # Drizzle schema
│   └── index.ts
├── lib/
│   ├── utils.ts          # Utility functions
│   ├── auth.ts           # Authentication
│   └── validators/       # Zod schemas
├── providers/
│   └── index.tsx         # React contexts (Auth, Wallet, Theme)
└── middleware.ts         # Route protection

scripts/
└── seed.ts               # Seed demo + admin users
```

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **USER** | Regular customer, can send SMS, manage contacts |
| **AGENT** | Higher volume, discounted rates (GH₵0.04/SMS) |
| **DEVELOPER** | API access, lowest rates (GH₵0.035/SMS) |
| **ADMIN** | Full platform management, set via database |

### Setting Admin Role

Admin role is assigned directly in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 🔒 Security Features

- **ACID Transactions**: Wallet operations use `FOR UPDATE` row locks
- **Double-Spend Prevention**: Atomic balance checks prevent concurrent deductions
- **Password Hashing**: Argon2id with 12 rounds
- **JWT Tokens**: Access (15min) + Refresh (7 days) tokens
- **API Keys**: SHA-256 hashed, prefix-only display
- **Rate Limiting**: Redis-based sliding window

---

## 📝 API Documentation

### Base URL
```
https://api.textflowpro.gh/v1
```

### Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### Send SMS
```bash
curl -X POST https://api.textflowpro.gh/v1/sms/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "+233241234567",
    "message": "Hello from TextFlow Pro!",
    "senderId": "MyCompany"
  }'
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_xxx",
  "cost": 0.05,
  "currency": "GHS",
  "recipient": "+233241234567"
}
```

---

## 🎯 Pages & Routes

### Public Pages
- `/` - Landing page with Ghanaian theme
- `/login` - Sign in
- `/register` - Create account

### User Dashboard (requires login)
- `/dashboard` - Overview & stats
- `/dashboard/sms` - Send single SMS
- `/dashboard/sms/bulk` - Upload CSV for bulk SMS
- `/dashboard/contacts` - Manage contacts
- `/dashboard/sender-ids` - Request sender IDs
- `/dashboard/wallet` - Top up & transactions
- `/dashboard/analytics` - Delivery reports
- `/dashboard/developer` - API keys & docs
- `/dashboard/settings` - Account settings

### Admin Panel (requires ADMIN role)
- `/admin` - Platform overview
- `/admin/users` - Manage all users
- `/admin/transactions` - All wallet transactions
- `/admin/sms` - All SMS logs
- `/admin/analytics` - Platform-wide stats
- `/admin/pricing` - Set SMS pricing
- `/admin/providers` - Configure SMS gateways
- `/admin/settings` - Platform configuration

---

## 🤝 Support

- 📧 Email: support@textflowpro.gh
- 💬 WhatsApp: +233 24 123 4567
- 📍 Location: Accra, Ghana

---

Built with ❤️ in Ghana 🇬🇭 using Next.js, PostgreSQL, and Ghanaian pride.
