# QR Ordering System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  QR Code → Store Menu → Cart → Checkout → Stripe → Success      │
│     ↓          ↓          ↓        ↓         ↓        ↓          │
│  Scan URL   Browse    Add Items  Phone   Payment  SMS OTP       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          STAFF FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Login → View Orders → Prepare → Mark Ready → Verify OTP → Done │
│    ↓         ↓           ↓           ↓           ↓          ↓    │
│  Auth   Filter List   Update    Auto Call   Check Code  Complete│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐   │
│  │   Next.js    │ ───► │   Express    │ ──► │ PostgreSQL   │   │
│  │   Frontend   │      │   Backend    │     │   Database   │   │
│  └──────────────┘      └──────────────┘     └──────────────┘   │
│         │                      │                                 │
│         │                      ├─────► Stripe (Payments)         │
│         │                      │                                 │
│         │                      └─────► Twilio (SMS + Calls)      │
│         │                                                        │
│         └────────────── Client-Side State ──────────────────────┘
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Order Creation Flow
```
Customer
  ↓ (Browse Menu)
Frontend fetches /api/stores/:slug/menu
  ↓ (Add to Cart - Client State)
Customer clicks "Checkout"
  ↓ (POST /api/checkout-session)
Backend:
  - Validates cart items
  - Calculates totals from DB prices (not client)
  - Creates Order (status: PENDING)
  - Creates Stripe Checkout Session
  ↓ (Redirect to Stripe)
Customer pays on Stripe
  ↓ (Webhook: checkout.session.completed)
Backend:
  - Marks order as PAID
  - Generates OTP and hashes it
  - Calculates profit metrics
  - Sends SMS with OTP
  - Creates payment record
  ↓
Customer receives SMS with OTP
```

### 2. Order Fulfillment Flow
```
Staff Dashboard
  ↓ (GET /api/staff/orders)
Backend returns orders for store
  ↓
Staff clicks "Start Preparing"
  ↓ (POST /api/staff/orders/:id/status)
Backend updates status to PREPARING
  ↓
Staff clicks "Mark Ready (& Call)"
  ↓ (POST /api/staff/orders/:id/status)
Backend:
  - Updates status to READY
  - Initiates Twilio call to customer
  - Logs call in database
  - Updates comm costs
  ↓
Customer receives automated call
  ↓
Customer arrives with OTP
  ↓
Staff enters OTP
  ↓ (POST /api/staff/orders/:id/complete)
Backend:
  - Verifies OTP hash
  - Checks expiry and attempts
  - Marks order COMPLETED
  ↓
Order workflow complete
```

## Database Schema Overview

### Core Tables

**stores**
- Primary entity for restaurant/merchant
- Has many menu_items and orders
- `slug` used for public URLs

**menu_items**
- Menu items with price and cost
- `priceCents` = selling price
- `costCents` = internal cost (for profit calc)
- `isAvailable` = can be ordered
- `sortOrder` = display order

**orders**
- Central order entity
- Tracks status workflow (PLACED → PREPARING → READY → COMPLETED)
- Stores payment status separately
- Contains OTP hash (never plain text)
- Profit metrics calculated and stored

**order_items**
- Line items for each order
- **Important**: Snapshots price and cost at order time
- Protects against future menu price changes
- Enables accurate historical profit reporting

**payments**
- Payment records from Stripe
- Links to order
- Stores receipt URL

**call_logs**
- Twilio call tracking
- Stores call SID, status, errors
- Used for debugging and cost tracking

## Security Considerations

### Implemented ✅

1. **Price Validation**: Backend calculates totals from DB, not client
2. **OTP Security**: 
   - Stored as HMAC hash with secret pepper
   - 60-minute expiry
   - 5 attempt limit
   - Rate limiting on verification
3. **Input Validation**: Zod schemas for all inputs
4. **Stripe Webhook**: Signature verification
5. **Staff Auth**: Password header (MVP)
6. **CORS**: Frontend URL whitelisting

### Production Enhancements 🚀

1. **Staff Auth**: Replace password header with JWT/session
2. **API Rate Limiting**: More granular limits per endpoint
3. **Database Security**: 
   - Connection pooling limits
   - Read-only replicas for reporting
   - Row-level security (RLS)
4. **Encryption**: Encrypt sensitive customer data at rest
5. **Audit Logging**: Log all staff actions
6. **2FA**: For staff dashboard access
7. **IP Whitelisting**: For staff endpoints
8. **WAF**: Web Application Firewall
9. **DDoS Protection**: CloudFlare or similar

## Scalability Considerations

### Current Architecture (MVP)
- Single server instance
- Single database
- Synchronous processing
- Good for: 1-10 stores, < 100 orders/day

### Scale to 100s of Orders/Day
1. **Database Optimization**:
   - Add indexes on frequently queried fields
   - Use connection pooling (PgBouncer)
   - Enable query caching

2. **Backend Optimization**:
   - Add Redis for session/cache
   - Use worker queues for SMS/calls
   - Implement caching layers

3. **Frontend Optimization**:
   - Static generation for menu pages
   - CDN for assets
   - Image optimization

### Scale to 1000s of Orders/Day
1. **Database**:
   - Read replicas for queries
   - Write primary for transactions
   - Partition orders by date

2. **Backend**:
   - Horizontal scaling (multiple instances)
   - Load balancer
   - Queue workers for async tasks (BullMQ)
   - Separate service for webhooks

3. **Infrastructure**:
   - Container orchestration (Kubernetes)
   - Auto-scaling groups
   - Database sharding by store_id

4. **Monitoring**:
   - APM (New Relic, DataDog)
   - Error tracking (Sentry)
   - Uptime monitoring
   - Performance metrics

## Cost Breakdown (Per Order)

### Fixed Costs
- **Stripe Fee**: 2.9% + $0.30
  - Example: $20 order = $0.88

### Variable Costs
- **SMS (OTP)**: ~$0.01 per message
- **Voice Call (Ready notification)**: ~$0.01 per call (30 seconds)
- **Total Comm Cost**: ~$0.02 per order

### Infrastructure (Monthly Estimates)
- **Database (PostgreSQL)**: $15-50
- **Backend Hosting**: $10-30
- **Frontend Hosting**: $0-20 (Vercel free tier)
- **Monitoring**: $0-50
- **Total**: ~$25-150/month for MVP

## Technology Choices - Why?

### Backend: Express + TypeScript
- **Pros**: Simple, flexible, TypeScript safety
- **Cons**: No built-in structure
- **Alternatives**: NestJS (more structure), Fastify (faster)

### Database: PostgreSQL + Prisma
- **Pros**: Reliable, ACID compliance, great tooling
- **Cons**: Harder to scale horizontally
- **Alternatives**: MongoDB (document model), CockroachDB (distributed)

### Frontend: Next.js
- **Pros**: SSR, great DX, App Router, SEO
- **Cons**: Opinionated, bundle size
- **Alternatives**: Remix, SvelteKit, Astro

### Payments: Stripe
- **Pros**: Best DX, reliable, feature-rich
- **Cons**: Higher fees than some alternatives
- **Alternatives**: Square, PayPal, Adyen

### Communications: Twilio
- **Pros**: Reliable, global coverage, easy API
- **Cons**: Can be expensive at scale
- **Alternatives**: AWS SNS, Vonage, Plivo

## Feature Extensions

### Easy Additions (< 1 day)
- [ ] Add order notes/special requests
- [ ] Email receipts
- [ ] Order history for customers
- [ ] Menu item images
- [ ] Store hours and auto-disable ordering
- [ ] Custom tip percentages (10%, 15%, 20%)

### Medium Additions (1-3 days)
- [ ] Multiple stores per account
- [ ] Menu categories/sections
- [ ] Item modifiers (size, extras)
- [ ] Customer accounts (email/password)
- [ ] Order scheduling (pickup time)
- [ ] Refunds handling
- [ ] Inventory tracking

### Complex Additions (1-2 weeks)
- [ ] Delivery support (address, driver assignment)
- [ ] Multi-location with geofencing
- [ ] Loyalty program / rewards
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (React Native)
- [ ] Kitchen display system (KDS)
- [ ] Print receipt integration

## Deployment Options

### Option 1: Railway (Easiest)
1. Connect GitHub repo
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically on push
**Cost**: ~$20-50/month

### Option 2: Vercel + Supabase
1. Deploy Next.js to Vercel
2. Deploy Express to Vercel (serverless functions)
3. Use Supabase PostgreSQL
**Cost**: ~$25-75/month

### Option 3: AWS (Most Control)
1. RDS for PostgreSQL
2. Elastic Beanstalk for Express
3. Amplify or S3+CloudFront for Next.js
**Cost**: ~$50-150/month

### Option 4: Self-Hosted (Cheapest)
1. VPS (DigitalOcean, Linode)
2. Docker Compose
3. Nginx reverse proxy
**Cost**: ~$10-20/month

## Monitoring & Observability

### Essential Metrics
- Order success rate
- Average order value
- Payment failure rate
- OTP verification success rate
- SMS/Call delivery rates
- API response times
- Error rates by endpoint

### Logging Strategy
- Structured logging (JSON)
- Log levels: ERROR, WARN, INFO, DEBUG
- Include: request_id, user_id, store_id
- Retention: 30 days (compliance)

### Alerting
- Payment webhook failures
- Database connection issues
- High error rates (> 5%)
- Slow queries (> 1s)
- Twilio delivery failures

## Compliance & Legal

### Consider
- **PCI DSS**: Stripe handles card data
- **GDPR**: If serving EU customers
  - Cookie consent
  - Data export/deletion
  - Privacy policy
- **TCPA**: SMS/Call consent required (we have checkboxes ✅)
- **ADA**: Accessibility compliance
- **PSD2**: Strong Customer Authentication (EU)

### Data Retention
- Orders: Keep indefinitely for accounting
- Payment records: 7 years (tax/audit)
- Call logs: 90 days
- Customer data: Until deletion requested

---

**Questions? Check the README.md or TESTING.md**
