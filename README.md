# QR Ordering System - MVP

A production-ready QR code ordering system with payments, OTP pickup verification, kitchen dashboard, and automated customer notifications.

## Features

### Customer Flow
- Scan QR code → Browse menu → Add to cart
- Enter phone number and consent for SMS/calls
- Pay securely via Stripe Checkout
- Receive 6-digit OTP via SMS for pickup
- Track order status in real-time
- Automated call when order is ready

### Staff Dashboard
- View all orders filtered by status
- Update order status (PLACED → PREPARING → READY → COMPLETED)
- Verify OTP for pickup completion
- Automated call to customer when marked READY
- Resend OTP if needed

### Profit Tracking
- Tracks item costs vs. selling prices
- Calculates Stripe fees (2.9% + $0.30)
- Tracks communication costs (SMS + calls)
- Computes gross and net profit per order
- Daily summary reports
- Item-wise profit analysis

## Tech Stack

**Backend:**
- Node.js + TypeScript + Express
- PostgreSQL via Prisma ORM
- Stripe for payments
- Twilio for SMS & voice calls
- Zod for validation

**Frontend:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Server & Client Components

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL)
- Stripe account (get test keys from https://dashboard.stripe.com/test/apikeys)
- Twilio account (get credentials from https://console.twilio.com)
- Stripe CLI (for webhook testing): https://stripe.com/docs/stripe-cli

## Quick Start

### 1. Clone and Install

```bash
cd /tmp/qr-ordering-system
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

Wait ~10 seconds for PostgreSQL to fully start.

### 3. Configure Environment

Copy the example env file and edit it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `STRIPE_SECRET_KEY` - Your Stripe test secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Will be set after Stripe CLI setup (whsec_...)
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_FROM_NUMBER` - Your Twilio phone number (E.164 format: +1234567890)
- `OTP_SECRET_PEPPER` - Change to a random string
- `STAFF_PASSWORD` - Change to a secure password

### 4. Database Setup

Run migrations and seed:

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

The seed will create:
- A store: "Downtown Cafe" (slug: `downtown-cafe`)
- 6 sample menu items

**Important:** Note the Store ID from the seed output - you'll need it for the staff dashboard.

### 5. Start Stripe Webhook Forwarding

In a new terminal, run the Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to http://localhost:3001/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) and update `STRIPE_WEBHOOK_SECRET` in your `.env` file.

### 6. Start the Backend

In a new terminal:

```bash
cd apps/api
npm run dev
```

Backend will run on http://localhost:3001

### 7. Start the Frontend

In another terminal:

```bash
cd apps/web
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

### Customer Order Flow

1. Open http://localhost:3000/store/downtown-cafe
2. Browse menu and add items to cart
3. Enter phone number in E.164 format (e.g., +12025551234)
4. Check consent boxes for SMS and call notifications
5. Click "Proceed to Payment"
6. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
7. Complete payment
8. Check your phone for SMS with 6-digit OTP
9. View order status at the success page

### Staff Dashboard

1. Open http://localhost:3000/staff
2. Login with:
   - Store ID: (get from seed output or database)
   - Password: (from .env STAFF_PASSWORD, default: admin123)
3. View orders filtered by status
4. Click "Start Preparing" to move order to PREPARING
5. Click "Mark Ready (& Call)" to:
   - Move order to READY status
   - Trigger automated call to customer
6. Enter the 6-digit OTP customer provides
7. Click "Complete" to finish the order

### Testing

**Get Store ID:**
```bash
cd apps/api
npx prisma studio
```
Open Prisma Studio → Stores → Copy the `id` field

**Test Phone Numbers (Twilio):**
- For development, use your verified Twilio number
- Or verify test numbers in Twilio console

**Stripe Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

## API Endpoints

### Public Endpoints

- `GET /api/stores/:slug/menu` - Get store menu
- `POST /api/checkout-session` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler (raw body)
- `GET /api/orders/:orderId` - Get order details

### Staff Endpoints (require X-Staff-Password header)

- `GET /api/staff/orders?storeId=&status=` - List orders
- `POST /api/staff/orders/:orderId/status` - Update status (body: {status})
- `POST /api/staff/orders/:orderId/complete` - Complete with OTP (body: {otp})
- `POST /api/staff/orders/:orderId/resend-otp` - Resend OTP SMS
- `GET /api/staff/reports/daily?storeId=&date=` - Daily summary
- `GET /api/staff/reports/items?storeId=&dateFrom=&dateTo=` - Item report

### Twilio Webhooks

- `GET /api/twilio/voice/order-ready?orderNumber=` - TwiML for "ready" call
- `POST /api/twilio/voice/status` - Call status callback

## Database Schema

**Tables:**
- `stores` - Store information
- `menu_items` - Menu items with price and cost
- `orders` - Orders with status, payment info, OTP, profit metrics
- `order_items` - Line items (snapshot price/cost)
- `payments` - Payment records
- `call_logs` - Twilio call tracking

**Order Statuses:**
- PLACED - Payment confirmed, order received
- PREPARING - Kitchen is preparing
- READY - Ready for pickup, customer notified
- COMPLETED - Customer picked up with OTP
- CANCELLED - Order cancelled

**Payment Statuses:**
- UNPAID - Initial state
- PENDING - Checkout session created
- PAID - Payment confirmed
- FAILED - Payment failed
- REFUNDED - Payment refunded

## Profit Calculation

For each order:

1. **Gross Profit** = Items Revenue - Items Cost
2. **Stripe Fee** = (Total × 2.9%) + $0.30
3. **Comm Costs** = SMS cost + Call cost
4. **Net Profit** = Gross Profit - Stripe Fee - Comm Costs

All values stored in cents.

## Development Tips

### View Database
```bash
cd apps/api
npx prisma studio
```

### Reset Database
```bash
cd apps/api
npx prisma migrate reset
```

### Add New Menu Items
Edit `apps/api/prisma/seed.ts` and run:
```bash
npm run seed
```

### Check Logs
- Backend logs appear in the terminal running `apps/api`
- Stripe webhook events in Stripe CLI terminal
- Twilio logs in Twilio console

## Deployment Considerations

### Environment Variables
- Set all production values in `.env`
- Use strong `OTP_SECRET_PEPPER` and `STAFF_PASSWORD`
- Set `NODE_ENV=production`

### Database
- Use managed PostgreSQL (e.g., Railway, Supabase, AWS RDS)
- Run migrations: `npx prisma migrate deploy`

### Webhooks
- Stripe: Set webhook endpoint to `https://yourdomain.com/api/stripe/webhook`
- Twilio: Set voice URL to `https://yourdomain.com/api/twilio/voice/order-ready`
- Twilio: Set status callback to `https://yourdomain.com/api/twilio/voice/status`

### Security
- Implement proper rate limiting for production
- Add HTTPS (required for Stripe/Twilio)
- Use environment-based CORS origins
- Consider JWT/session auth for staff instead of password header

### Monitoring
- Log all Stripe webhook events
- Monitor Twilio usage and costs
- Track failed OTP attempts
- Set up error alerting

## Troubleshooting

**Database connection fails:**
- Ensure Docker is running: `docker ps`
- Check PostgreSQL is healthy: `docker-compose ps`
- Verify DATABASE_URL in `.env`

**Stripe webhook not working:**
- Ensure Stripe CLI is running
- Check webhook secret matches `.env`
- Verify backend is running on port 3001

**SMS/Calls not working:**
- Verify Twilio credentials
- Check phone number format (E.164)
- Ensure phone is verified in Twilio (trial accounts)
- Check Twilio console for error logs

**OTP verification fails:**
- Check OTP expiry (60 minutes)
- Verify attempts < 5
- Ensure order status is READY
- Try resending OTP

**Frontend can't connect to API:**
- Check NEXT_PUBLIC_API_URL in frontend
- Ensure backend is running on correct port
- Check CORS settings in backend

## Project Structure

```
qr-ordering-system/
├── apps/
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── config/   # Environment config
│   │   │   ├── middleware/ # Auth, rate limiting
│   │   │   ├── routes/   # API routes
│   │   │   ├── services/ # Business logic
│   │   │   └── utils/    # Validation, helpers
│   │   └── prisma/       # Schema, migrations, seed
│   └── web/              # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       └── lib/          # API client
├── .env                  # Environment variables
├── docker-compose.yml    # PostgreSQL setup
└── README.md            # This file
```

## License

MIT

## Support

For issues or questions, check:
1. Logs in terminal
2. Database state in Prisma Studio
3. Stripe dashboard for payment events
4. Twilio console for messaging logs

---

**Built with ❤️ for seamless QR ordering**
