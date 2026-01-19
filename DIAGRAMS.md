# System Diagrams - QR Ordering System

Visual representations of system architecture, data flow, and workflows.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          QR ORDERING SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │   Customer   │
                            │   (Mobile)   │
                            └──────┬───────┘
                                   │ Scans QR Code
                                   ▼
                     ┌─────────────────────────┐
                     │   Next.js Frontend      │
                     │   (Port 3000)           │
                     │                         │
                     │  • Menu Display         │
                     │  • Shopping Cart        │
                     │  • Order Tracking       │
                     │  • Staff Dashboard      │
                     └────────┬────────────────┘
                              │ API Calls
                              ▼
                     ┌─────────────────────────┐
                     │   Express Backend       │
                     │   (Port 3001)           │
                     │                         │
                     │  • API Routes           │
                     │  • Business Logic       │
                     │  • Validation           │
                     └──┬────┬────┬────┬───────┘
                        │    │    │    │
        ┌───────────────┘    │    │    └──────────────┐
        │                    │    │                   │
        ▼                    ▼    ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐
│  PostgreSQL  │   │    Stripe    │   │       Twilio         │
│  (Database)  │   │  (Payments)  │   │  (SMS + Voice)       │
│              │   │              │   │                      │
│  • Stores    │   │  • Checkout  │   │  • SMS (OTP)         │
│  • Menu      │   │  • Webhooks  │   │  • Voice (Ready)     │
│  • Orders    │   │  • Fees      │   │  • Status Tracking   │
│  • Payments  │   └──────────────┘   └──────────────────────┘
│  • Call Logs │
└──────────────┘
```

## Order Lifecycle State Machine

```
                        ┌──────────────────────┐
                        │   Payment Initiated   │
                        │   (Customer Checkout) │
                        └──────────┬───────────┘
                                   │
                                   │ Stripe Checkout
                                   ▼
                        ┌──────────────────────┐
                        │  Payment Completed    │
                        │  (Webhook Received)   │
                        └──────────┬───────────┘
                                   │
                                   │ Generate OTP
                                   │ Send SMS
                                   ▼
    ┌──────────────┐     ┌─────────────────────┐
    │  CANCELLED   │ ◄───┤      PLACED         │
    │              │     │  (Confirmed Order)   │
    └──────────────┘     └──────────┬──────────┘
                                    │
                                    │ Staff Action
                                    ▼
                        ┌─────────────────────┐
                        │     PREPARING        │
                        │  (Kitchen Working)   │
                        └──────────┬──────────┘
                                   │
                                   │ Staff Action
                                   │ + Auto Call
                                   ▼
                        ┌─────────────────────┐
                        │       READY          │
                        │  (Call Customer)     │
                        └──────────┬──────────┘
                                   │
                                   │ Verify OTP
                                   ▼
                        ┌─────────────────────┐
                        │     COMPLETED        │
                        │   (Order Picked Up)  │
                        └─────────────────────┘
```

## Data Flow: Order Creation

```
Customer                Frontend              Backend               Database         Stripe          Twilio
   │                       │                     │                     │               │               │
   │ 1. Browse Menu        │                     │                     │               │               │
   ├──────────────────────►│                     │                     │               │               │
   │                       │ 2. GET /menu/:slug  │                     │               │               │
   │                       ├────────────────────►│                     │               │               │
   │                       │                     │ 3. Query Menu       │               │               │
   │                       │                     ├────────────────────►│               │               │
   │                       │                     │◄────────────────────┤               │               │
   │                       │◄────────────────────┤ 4. Return Menu      │               │               │
   │◄──────────────────────┤                     │                     │               │               │
   │                       │                     │                     │               │               │
   │ 5. Add to Cart        │                     │                     │               │               │
   │ (Client State)        │                     │                     │               │               │
   │                       │                     │                     │               │               │
   │ 6. Checkout           │                     │                     │               │               │
   ├──────────────────────►│                     │                     │               │               │
   │                       │ 7. POST /checkout   │                     │               │               │
   │                       ├────────────────────►│                     │               │               │
   │                       │                     │ 8. Create Order     │               │               │
   │                       │                     │    (PENDING)        │               │               │
   │                       │                     ├────────────────────►│               │               │
   │                       │                     │                     │               │               │
   │                       │                     │ 9. Create Session   │               │               │
   │                       │                     ├─────────────────────┼──────────────►│               │
   │                       │                     │◄─────────────────────────────────────┤               │
   │                       │◄────────────────────┤ 10. Session URL     │               │               │
   │                       │                     │                     │               │               │
   │ 11. Redirect          │                     │                     │               │               │
   ├───────────────────────┼─────────────────────┼─────────────────────┼───────────────►│               │
   │                       │                     │                     │               │               │
   │ 12. Pay               │                     │                     │               │               │
   ├───────────────────────┼─────────────────────┼─────────────────────┼──────────────►│               │
   │                       │                     │                     │               │               │
   │                       │                     │ 13. Webhook         │               │               │
   │                       │                     │◄─────────────────────────────────────┤               │
   │                       │                     │                     │               │               │
   │                       │                     │ 14. Update Order    │               │               │
   │                       │                     │     (PAID)          │               │               │
   │                       │                     ├────────────────────►│               │               │
   │                       │                     │                     │               │               │
   │                       │                     │ 15. Generate OTP    │               │               │
   │                       │                     │     Hash & Save     │               │               │
   │                       │                     ├────────────────────►│               │               │
   │                       │                     │                     │               │               │
   │                       │                     │ 16. Send SMS        │               │               │
   │                       │                     ├─────────────────────┼───────────────┼──────────────►│
   │◄──────────────────────┼─────────────────────┼─────────────────────┼───────────────┼───────────────┤
   │ 17. Receive OTP       │                     │                     │               │               │
   │                       │                     │                     │               │               │
```

## Staff Dashboard Workflow

```
Staff                  Frontend               Backend              Database         Twilio
  │                       │                      │                    │               │
  │ 1. Login              │                      │                    │               │
  ├──────────────────────►│                      │                    │               │
  │                       │ 2. POST /staff/login │                    │               │
  │                       │    (validate pwd)    │                    │               │
  │                       ├─────────────────────►│                    │               │
  │                       │◄─────────────────────┤                    │               │
  │◄──────────────────────┤ 3. Auth OK           │                    │               │
  │                       │                      │                    │               │
  │ 4. View Orders        │                      │                    │               │
  ├──────────────────────►│                      │                    │               │
  │                       │ 5. GET /staff/orders │                    │               │
  │                       ├─────────────────────►│ 6. Query Orders    │               │
  │                       │                      ├───────────────────►│               │
  │                       │                      │◄───────────────────┤               │
  │                       │◄─────────────────────┤ 7. Return List     │               │
  │◄──────────────────────┤                      │                    │               │
  │                       │                      │                    │               │
  │ 8. Mark Preparing     │                      │                    │               │
  ├──────────────────────►│                      │                    │               │
  │                       │ 9. POST .../status   │                    │               │
  │                       ├─────────────────────►│ 10. Update Status  │               │
  │                       │                      ├───────────────────►│               │
  │                       │◄─────────────────────┤                    │               │
  │◄──────────────────────┤                      │                    │               │
  │                       │                      │                    │               │
  │ 11. Mark Ready        │                      │                    │               │
  ├──────────────────────►│                      │                    │               │
  │                       │ 12. POST .../status  │                    │               │
  │                       ├─────────────────────►│ 13. Update Status  │               │
  │                       │                      ├───────────────────►│               │
  │                       │                      │                    │               │
  │                       │                      │ 14. Make Call      │               │
  │                       │                      ├────────────────────┼──────────────►│
  │                       │                      │                    │               │
  │                       │                      │ 15. Log Call       │               │
  │                       │                      ├───────────────────►│               │
  │                       │◄─────────────────────┤                    │               │
  │◄──────────────────────┤                      │                    │               │
  │                       │                      │                    │               │
  │ 16. Enter OTP         │                      │                    │               │
  ├──────────────────────►│                      │                    │               │
  │                       │ 17. POST .../complete│                    │               │
  │                       ├─────────────────────►│ 18. Verify Hash    │               │
  │                       │                      │    Check Expiry    │               │
  │                       │                      │    Check Attempts  │               │
  │                       │                      │                    │               │
  │                       │                      │ 19. Complete Order │               │
  │                       │                      ├───────────────────►│               │
  │                       │◄─────────────────────┤                    │               │
  │◄──────────────────────┤ 20. Success          │                    │               │
  │                       │                      │                    │               │
```

## Database Schema Relationships

```
┌──────────────────────┐
│       stores         │
│──────────────────────│
│ id (PK)              │
│ name                 │
│ slug                 │──┐
│ timezone             │  │
└──────────────────────┘  │
                          │
         ┌────────────────┤
         │                │
         ▼                ▼
┌──────────────────────┐ ┌──────────────────────┐
│     menu_items       │ │       orders         │
│──────────────────────│ │──────────────────────│
│ id (PK)              │ │ id (PK)              │
│ store_id (FK) ───────┘ │ store_id (FK)────────┘
│ name                 │ │ order_number         │
│ price_cents          │ │ customer_phone_e164  │
│ cost_cents           │ │ status               │
│ is_available         │ │ payment_status       │
└──────────┬───────────┘ │ total_cents          │
           │             │ pickup_otp_hash      │
           │             │ stripe_fee_cents     │
           │             │ comm_cost_cents      │
           │             │ gross_profit_cents   │
           │             │ net_profit_cents     │
           │             └──────────┬───────────┘
           │                        │
           │         ┌──────────────┼──────────────┐
           │         │              │              │
           ▼         ▼              ▼              ▼
   ┌──────────────────────┐ ┌──────────────┐ ┌──────────────┐
   │   order_items        │ │   payments   │ │  call_logs   │
   │──────────────────────│ │──────────────│ │──────────────│
   │ id (PK)              │ │ id (PK)      │ │ id (PK)      │
   │ order_id (FK)────────┤ │ order_id (FK)│ │ order_id (FK)│
   │ menu_item_id (FK)────┤ │ provider     │ │ twilio_sid   │
   │ name_snapshot        │ │ amount_cents │ │ status       │
   │ price_cents_snapshot │ │ status       │ │ error_code   │
   │ cost_cents_snapshot  │ │ receipt_url  │ └──────────────┘
   │ quantity             │ └──────────────┘
   └──────────────────────┘
```

## OTP Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    OTP Generation                            │
└─────────────────────────────────────────────────────────────┘

Webhook Received
      │
      ▼
Generate Random 6-digit Number
      │ (crypto.randomInt)
      ▼
    123456
      │
      ├─────────────────┬──────────────────┐
      │                 │                  │
      ▼                 ▼                  ▼
  Save Last 4      Create Hash        Set Expiry
   (1234)         HMAC-SHA256       (60 minutes)
      │           + SECRET_PEPPER        │
      │                 │                │
      ├─────────────────┼────────────────┤
      │                 │                │
      ▼                 ▼                ▼
  ┌────────────────────────────────────────────┐
  │              Store in DB:                  │
  │  • pickup_otp_last4: "1234"                │
  │  • pickup_otp_hash: "abc123def..."         │
  │  • pickup_otp_expires_at: 2026-...-19:00   │
  │  • pickup_otp_attempts: 0                  │
  └────────────────────────────────────────────┘
      │
      ▼
  Send via SMS
   "Your OTP: 123456"

┌─────────────────────────────────────────────────────────────┐
│                    OTP Verification                          │
└─────────────────────────────────────────────────────────────┘

Staff Enters OTP
      │
      ▼
  Validate Input
  (6 digits)
      │
      ▼
  Check Expiry ──────► EXPIRED? ──► Return Error
      │ OK
      ▼
  Check Attempts ────► >= 5? ──────► Return Error
      │ < 5
      ▼
  Hash Input OTP
  (same algorithm)
      │
      ▼
  Compare Hashes ────► MATCH? ──────┬──► NO ──► Increment Attempts
      │                             │           Return Error
      │ YES                         │
      ▼                             │
  Complete Order                    │
  Clear OTP Hash                    │
  Return Success                    │
```

## Profit Calculation Flow

```
Order Items:
  • Latte: $5.50 (cost: $1.30) × 1 = $5.50 revenue, $1.30 cost
  • Croissant: $4.50 (cost: $1.50) × 1 = $4.50 revenue, $1.50 cost
                                         ──────────────────────────
                                         $10.00 revenue, $2.80 cost

Subtotal: $10.00 (1000 cents)
Tip:      $2.00  (200 cents)
          ─────
Total:    $12.00 (1200 cents)

┌────────────────────────────────────────────────────────────┐
│                   Calculate Stripe Fee                     │
└────────────────────────────────────────────────────────────┘

Total × 2.9% = 1200 × 0.029 = 34.8 cents
Fixed Fee = 30 cents
────────────────────────────
Stripe Fee = 65 cents

┌────────────────────────────────────────────────────────────┐
│                Calculate Communication Costs                │
└────────────────────────────────────────────────────────────┘

SMS (OTP) = 1 cent
Voice Call (Ready notification) = 1 cent
────────────────────────────
Comm Costs = 2 cents

┌────────────────────────────────────────────────────────────┐
│                   Calculate Profit                          │
└────────────────────────────────────────────────────────────┘

Items Revenue = 1000 cents
Items Cost = 280 cents
────────────────────────────
Gross Profit = 720 cents

Gross Profit - Stripe Fee - Comm Costs
720 - 65 - 2 = 653 cents
────────────────────────────
Net Profit = $6.53
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 14 + React + TypeScript + Tailwind CSS             │
│  • Server Components     • Client Components                │
│  • App Router            • Form Handling                    │
│  • SEO Optimization      • Responsive Design                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  Express + TypeScript                                        │
│  • RESTful Routes        • Middleware                       │
│  • Validation (Zod)      • Rate Limiting                    │
│  • Error Handling        • CORS                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  Services + Utilities                                        │
│  • OTP Service           • Payment Service                  │
│  • SMS Service           • Voice Service                    │
│  • Profit Service        • Validation Schemas               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│  Prisma ORM                                                  │
│  • Type-safe Queries     • Migrations                       │
│  • Relations             • Transactions                     │
│  • Connection Pooling    • Schema Management                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  PostgreSQL                                                  │
│  • ACID Compliance       • Indexes                          │
│  • Foreign Keys          • Constraints                      │
│  • Performance           • Reliability                      │
└─────────────────────────────────────────────────────────────┘

                    EXTERNAL SERVICES
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│    Stripe      │  │    Twilio      │  │    Docker      │
│  • Checkout    │  │  • SMS         │  │  • PostgreSQL  │
│  • Webhooks    │  │  • Voice       │  │  • Container   │
│  • Payments    │  │  • Status      │  │  • Management  │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

These diagrams provide visual understanding of:
- **System Architecture**: How components interact
- **Order Lifecycle**: Status transitions
- **Data Flow**: Request/response sequences
- **Database Schema**: Table relationships
- **OTP Security**: Generation and verification
- **Profit Calculation**: Step-by-step breakdown
- **Tech Stack**: Layered architecture

Use these diagrams for:
- Onboarding new developers
- System documentation
- Architecture presentations
- Debugging complex flows
- Understanding dependencies
