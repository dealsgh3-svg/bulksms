# SMS SaaS Platform - Technical Specification

## 1. Concept & Vision

**TextFlow Pro** is an enterprise-grade Bulk SMS SaaS platform designed for businesses, developers, and agencies to send mass communications via SMS. The platform combines a sleek, intuitive user interface with robust infrastructure featuring prepaid wallets, dual payment gateways, and comprehensive API access. The experience feels premium, fast, and trustworthy—like having a telecom carrier's control panel without the complexity.

## 2. Design Language

### Aesthetic Direction
Modern SaaS aesthetic with glassmorphism accents, inspired by Linear and Vercel's dashboard designs. Clean lines, purposeful whitespace, and subtle depth through shadows and backdrop blurs.

### Color Palette
```
Primary:        #6366F1 (Indigo-500)
Secondary:      #8B5CF6 (Violet-500)  
Accent:         #06B6D4 (Cyan-500)
Success:        #10B981 (Emerald-500)
Warning:        #F59E0B (Amber-500)
Error:          #EF4444 (Red-500)
Background:     #FAFAFA (Light) / #0F0F0F (Dark)
Surface:        #FFFFFF (Light) / #1A1A1A (Dark)
Text Primary:   #18181B (Light) / #FAFAFA (Dark)
Text Secondary: #71717A (Light) / #A1A1AA (Dark)
Border:         #E4E4E7 (Light) / #27272A (Dark)
```

### Typography
- **Headings**: Inter (600, 700 weights)
- **Body**: Inter (400, 500 weights)
- **Monospace**: JetBrains Mono (for code/API keys)
- **Scale**: 12px / 14px / 16px / 18px / 24px / 30px / 36px / 48px

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- Border radius: 6px (small), 8px (medium), 12px (large), 16px (xl)
- Container max-width: 1400px

### Motion Philosophy
- **Micro-interactions**: 150-200ms ease-out for hovers, button presses
- **Page transitions**: 300ms ease-in-out with staggered reveals
- **Data loading**: Skeleton shimmer at 1.5s cycle
- **Notifications**: Slide in from top-right, 250ms spring
- **Modals**: Scale 0.95→1 with fade, 200ms

## 3. Layout & Structure

### Public Pages
- **Landing Page**: Hero with animated stats, features grid, pricing tiers, testimonials, CTA
- **Auth Pages**: Centered card layout with branded left panel

### User Dashboard
- **Sidebar**: Collapsible 240px→64px, icon-only mode on mobile
- **Header**: 64px fixed, contains search, notifications bell, wallet balance, user avatar dropdown
- **Main Content**: Fluid with max-width 1400px, responsive padding
- **Quick SMS**: Full-width form with live character/page counter
- **Bulk SMS**: Step wizard (Upload → Map → Preview → Confirm)
- **Analytics**: Grid of metric cards + chart area + data table

### Admin Panel
- **Separate layout** with top navigation tabs
- **Metrics bar**: Sticky below header with live updating numbers
- **Data tables**: Full-featured with inline actions, bulk operations

### Responsive Strategy
- Mobile-first breakpoints: 640px, 768px, 1024px, 1280px
- Sidebar becomes bottom sheet drawer on mobile
- Tables become card-based lists on mobile
- Charts stack vertically on mobile

## 4. Features & Interactions

### Authentication
- **Register**: Multi-step form (credentials → verification → welcome)
- **Login**: Email/password with "Remember me" option
- **Verification**: 6-digit code via email/WhatsApp with resend timer (60s)
- **Password Reset**: Email-based with secure token expiry (1 hour)
- **Session**: JWT with 7-day refresh tokens, concurrent session limit (3)

### Wallet System
- **Deposit**: Amount input → Gateway selection → Payment modal → Webhook confirmation
- **Balance Display**: Real-time in header, animated on change
- **Transaction History**: Filterable by type, date range, amount range
- **Audit Trail**: Every credit/debit logged with admin notes for manual adjustments

### SMS Dispatch
- **Quick SMS**: 
  - Recipient input with contact picker
  - Message textarea with live counter (characters + pages)
  - Cost preview before sending
  - Rate: 1 page = 160 chars (GSM-7) or 70 chars (Unicode)
- **Bulk SMS**:
  - Drag-drop CSV/Excel upload
  - Auto-detect phone column with preview
  - Manual column mapping interface
  - Deduplication option
  - Group selection from address book
- **Scheduled SMS**:
  - Date/time picker with timezone display
  - Recurring options (daily, weekly, monthly)
  - Edit/cancel before execution
- **Sender IDs**:
  - Request new sender ID (11 chars alphanumeric)
  - Status tracking (Pending→Approved/Rejected)
  - Set default sender ID

### Address Book
- **Contacts**: Full CRUD with custom fields
- **Groups**: Create groups, assign contacts, bulk operations
- **Import/Export**: CSV format with duplicate handling

### Developer Hub
- **API Keys**: Generate Live/Test keys, view last used, roll key
- **IP Whitelist**: Add/remove IPs for API access
- **Usage Metrics**: API calls today/month, success rate, top endpoints
- **Documentation**: Interactive Swagger-style reference

### Admin Panel
- **Analytics Dashboard**: Revenue, SMS volume, user growth charts
- **User Management**: CRUD, role assignment, wallet manipulation
- **Pricing Engine**: Per-tier rate configuration
- **Gateway Config**: Provider credentials, active gateway toggle
- **CMS Settings**: Branding, colors, content, social links

## 5. Component Inventory

### Buttons
- **Primary**: Solid indigo, white text, hover:darken 10%, active:scale 0.98
- **Secondary**: Border indigo, transparent bg, hover:bg-indigo-50
- **Ghost**: No border, hover:bg-slate-100
- **Danger**: Red variant for destructive actions
- **Loading**: Spinner replaces text, disabled state

### Form Inputs
- **Text Input**: 40px height, border-slate-200, focus:ring-2 ring-indigo-500
- **Select**: Custom dropdown with search for long lists
- **Textarea**: Auto-resize, character counter option
- **File Upload**: Drag-drop zone with progress indicator
- **Toggle**: Smooth slide animation, color change

### Cards
- **Metric Card**: Icon, value, label, trend indicator
- **Data Card**: Header with actions, scrollable body
- **Action Card**: Large CTA with description

### Tables
- **Data Table**: Sortable headers, row selection, pagination
- **States**: Loading skeleton, empty state with illustration
- **Actions**: Icon buttons with tooltips

### Modals
- **Confirmation Modal**: Icon, title, description, dual buttons
- **Form Modal**: Title, scrollable form, sticky footer with actions
- **Slide-over**: Right-aligned panel for details/editing

### Notifications
- **Toast**: Auto-dismiss (5s), manual close, stacked
- **Badge**: Numeric indicator for unread counts

## 6. Technical Approach

### Framework & Architecture
- **Next.js 14** with App Router for both frontend and API
- **TypeScript** strict mode for type safety
- **Drizzle ORM** for type-safe database queries
- **Redis** for caching, rate limiting, and job queues
- **BullMQ** for scheduled SMS and async processing

### API Design
```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-email
POST   /api/auth/verify-whatsapp
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

SMS:
POST   /api/sms/send          - Send single/bulk SMS
GET    /api/sms/status/:id    - Get delivery status
POST   /api/sms/schedule      - Schedule SMS
DELETE /api/sms/cancel/:id    - Cancel scheduled

Wallet:
GET    /api/wallet/balance     - Get current balance
GET    /api/wallet/history     - Transaction history
POST   /api/wallet/deposit     - Initialize payment

Sender IDs:
GET    /api/sender-ids         - List user's sender IDs
POST   /api/sender-ids/request - Request new sender ID

Contacts:
GET    /api/contacts           - List contacts
POST   /api/contacts           - Create contact
PUT    /api/contacts/:id      - Update contact
DELETE /api/contacts/:id      - Delete contact
POST   /api/contacts/import   - Bulk import

Groups:
GET    /api/groups            - List groups
POST   /api/groups            - Create group
PUT    /api/groups/:id        - Update group
DELETE /api/groups/:id        - Delete group

Developer:
GET    /api/developer/keys     - List API keys
POST   /api/developer/keys     - Generate new key
DELETE /api/developer/keys/:id - Revoke key
PUT    /api/developer/whitelist - Update IP whitelist

Payments:
POST   /api/payments/initialize - Create payment
POST   /api/webhooks/kora       - Kora webhook
POST   /api/webhooks/paystack   - Paystack webhook

Admin:
GET    /api/admin/users        - List users
PUT    /api/admin/users/:id    - Update user
GET    /api/admin/settings     - Get settings
PUT    /api/admin/settings     - Update settings
GET    /api/admin/analytics    - Dashboard analytics
```

### Data Model
```
Users
├── id (uuid, pk)
├── email (unique)
├── passwordHash
├── fullName
├── whatsappNumber (unique)
├── role (enum: USER, AGENT, DEVELOPER, ADMIN)
├── emailVerified (bool)
├── whatsappVerified (bool)
├── isActive (bool)
├── createdAt, updatedAt
└── wallet (1:1)

Wallets
├── id (uuid, pk)
├── userId (fk → users)
├── balance (decimal, default 0)
└── updatedAt

Transactions
├── id (uuid, pk)
├── walletId (fk → wallets)
├── type (enum: CREDIT, DEBIT)
├── amount (decimal)
├── description
├── reference (unique)
├── adminId (nullable, for manual adjustments)
└── createdAt

SMSLogs
├── id (uuid, pk)
├── userId (fk → users)
├── senderId
├── recipient
├── message
├── pages (int)
├── cost (decimal)
├── status (enum: PENDING, SENT, DELIVERED, FAILED)
├── provider (enum: WEB, API)
├── externalId (provider's message ID)
├── errorCode (nullable)
└── createdAt, deliveredAt

SenderIDs
├── id (uuid, pk)
├── userId (fk → users)
├── senderId (varchar 11)
├── status (enum: PENDING, APPROVED, REJECTED)
├── isDefault (bool)
└── createdAt

APIKeys
├── id (uuid, pk)
├── userId (fk → users)
├── key (unique, hashed)
├── name
├── type (enum: LIVE, TEST)
├── lastUsedAt
├── ipWhitelist (jsonb array)
├── isActive (bool)
└── createdAt

Contacts
├── id (uuid, pk)
├── userId (fk → users)
├── phone
├── name
├── email
├── tags (jsonb array)
├── customFields (jsonb)
└── createdAt

Groups
├── id (uuid, pk)
├── userId (fk → users)
├── name
├── description
├── contactCount (denormalized)
└── createdAt

GroupContacts (junction)
├── groupId (fk → groups)
├── contactId (fk → contacts)
└── PRIMARY KEY (groupId, contactId)

Settings (singleton)
├── id (int, pk)
├── siteName
├── tagline
├── logoUrl
├── faviconUrl
├── primaryColor
├── secondaryColor
├── accentColor
├── whatsappSupport
├── socialLinks (jsonb)
├── footerContent
├── copyright
├── termsUrl
├── privacyUrl
├── activePaymentGateway (enum: KORA, PAYSTACK)
├── koraSecretKey (encrypted)
├── koraPublicKey
├── koraWebhookSecret
├── paystackSecretKey (encrypted)
├── paystackPublicKey
├── paystackWebhookSecret
└── pricingTiers (jsonb)

Providers (SMS providers)
├── id (uuid, pk)
├── name
├── apiBaseUrl
├── apiKey (encrypted)
├── senderIdRestrictions
├── isActive (bool)
├── priority (int)
└── createdAt
```

### Authentication Strategy
- **JWT tokens** stored in httpOnly cookies
- **Access token**: 15min expiry, contains userId, role
- **Refresh token**: 7 day expiry, stored in DB
- **Password hashing**: Argon2id
- **Rate limiting**: 5 attempts per minute for auth endpoints

### SMS Processing Flow
1. User submits SMS request
2. Validate balance, format recipient, calculate cost
3. Deduct from wallet (transactional)
4. Queue job in BullMQ
5. Worker picks up job
6. Call upstream SMS provider API
7. Update log status based on response
8. If scheduled, delay job until scheduled time

### Payment Processing Flow
1. User selects deposit amount
2. Initialize payment with active gateway
3. Create pending transaction record
4. Redirect to gateway checkout
5. Gateway calls webhook on success/failure
6. Verify webhook signature
7. Update transaction to completed
8. Credit wallet balance
9. Emit real-time update via SSE/polling

## 7. Security Measures

- **Input validation**: Zod schemas for all API inputs
- **SQL injection**: Parameterized queries via Drizzle
- **XSS**: React's built-in escaping + CSP headers
- **CSRF**: SameSite cookies + custom header validation
- **Rate limiting**: Redis-based sliding window
- **API keys**: Hashed in DB, shown once on creation
- **Webhook verification**: Signature validation for each provider
- **Admin access**: Separate admin-only routes with role check middleware
