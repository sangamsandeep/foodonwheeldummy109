# Startup Checklist - QR Ordering System

Use this checklist before starting development or deploying to production.

## ✅ Prerequisites

### Software Installed
- [ ] Node.js 18 or higher (`node --version`)
- [ ] npm (`npm --version`)
- [ ] Docker Desktop (for PostgreSQL)
- [ ] Git (for version control)
- [ ] Stripe CLI (for webhook testing)
- [ ] VS Code or preferred editor

### Accounts Created
- [ ] Stripe account (https://dashboard.stripe.com)
- [ ] Twilio account (https://console.twilio.com)
- [ ] GitHub account (optional, for deployment)

## ✅ Initial Setup

### 1. Project Installation
- [ ] Navigated to project directory
- [ ] Ran `npm install` in root
- [ ] Ran `npm install` in `apps/api`
- [ ] Ran `npm install` in `apps/web`
- [ ] No installation errors

### 2. Environment Configuration
- [ ] Copied `.env.example` to `.env`
- [ ] Set `DATABASE_URL` (default OK for local dev)
- [ ] Set `STRIPE_SECRET_KEY` (from Stripe dashboard)
- [ ] Set `STRIPE_WEBHOOK_SECRET` (will get after Stripe CLI setup)
- [ ] Set `TWILIO_ACCOUNT_SID` (from Twilio console)
- [ ] Set `TWILIO_AUTH_TOKEN` (from Twilio console)
- [ ] Set `TWILIO_FROM_NUMBER` (your Twilio phone number)
- [ ] Changed `OTP_SECRET_PEPPER` to random string
- [ ] Changed `STAFF_PASSWORD` to secure password
- [ ] Verified all URLs are correct

### 3. Database Setup
- [ ] Started Docker Desktop
- [ ] Ran `docker-compose up -d`
- [ ] Waited 10 seconds for PostgreSQL to start
- [ ] Ran `cd apps/api`
- [ ] Ran `npx prisma migrate dev --name init`
- [ ] Migration completed successfully
- [ ] Ran `npx prisma db seed`
- [ ] Seed completed with Store ID displayed
- [ ] Saved Store ID for later

### 4. Stripe Setup
- [ ] Opened new terminal
- [ ] Ran `stripe login` (if first time)
- [ ] Ran `stripe listen --forward-to http://localhost:3001/api/stripe/webhook`
- [ ] Copied webhook secret (starts with `whsec_`)
- [ ] Updated `.env` with `STRIPE_WEBHOOK_SECRET`
- [ ] Stripe CLI shows "Ready! You are using Stripe API Version ..."

### 5. Twilio Setup
- [ ] Verified phone number in Twilio (for trial accounts)
- [ ] Tested sending SMS from Twilio console
- [ ] Tested making call from Twilio console
- [ ] Confirmed FROM_NUMBER is correct format (+1234567890)

## ✅ Starting the Application

### Terminal Setup (4 terminals needed)

#### Terminal 1: PostgreSQL
```powershell
docker-compose up
```
- [ ] PostgreSQL container running
- [ ] Shows "database system is ready to accept connections"

#### Terminal 2: Stripe Webhooks
```powershell
stripe listen --forward-to http://localhost:3001/api/stripe/webhook
```
- [ ] Shows "Ready! You are using Stripe API Version..."
- [ ] Webhook secret copied to .env

#### Terminal 3: Backend API
```powershell
cd apps/api
npm run dev
```
- [ ] Shows "🚀 Server running on http://localhost:3001"
- [ ] No errors in console

#### Terminal 4: Frontend
```powershell
cd apps/web
npm run dev
```
- [ ] Shows "Ready in Xms"
- [ ] Running on http://localhost:3000

## ✅ Smoke Tests

### Backend Health Check
- [ ] Open http://localhost:3001/health
- [ ] See: `{"status":"ok","timestamp":"..."}`

### Frontend Homepage
- [ ] Open http://localhost:3000
- [ ] See "QR Ordering System" heading
- [ ] See "View Demo Store" and "Staff Dashboard" buttons

### Menu Page
- [ ] Click "View Demo Store" or go to http://localhost:3000/store/downtown-cafe
- [ ] See "Downtown Cafe" heading
- [ ] See 6 menu items (Espresso, Cappuccino, etc.)
- [ ] Cart is empty initially

### Add to Cart
- [ ] Click "Add to Cart" on any item
- [ ] Cart updates with item
- [ ] Can increase/decrease quantity
- [ ] Subtotal calculates correctly

### Checkout Redirect (No payment yet)
- [ ] Add items to cart
- [ ] Enter phone: +12025551234
- [ ] Check both consent boxes
- [ ] Click "Proceed to Payment"
- [ ] Redirects to Stripe Checkout page
- [ ] Items appear correctly on Stripe page
- [ ] **Do not pay yet** - just verify redirect works

### Staff Dashboard Access
- [ ] Go to http://localhost:3000/staff
- [ ] Enter Store ID (from seed output)
- [ ] Enter Password (from .env, default: admin123)
- [ ] Click "Login"
- [ ] Dashboard loads (may be empty if no orders yet)

## ✅ Full End-to-End Test

### Complete Order Flow
- [ ] Start at menu page
- [ ] Add 2-3 items to cart
- [ ] Enter valid phone number
- [ ] Check both consents
- [ ] Click "Proceed to Payment"
- [ ] On Stripe: Enter card `4242 4242 4242 4242`
- [ ] Enter expiry: 12/34, CVC: 123
- [ ] Click "Pay"
- [ ] Redirects to success page
- [ ] Check Stripe CLI terminal - see webhook received
- [ ] Check Backend terminal - see order processed
- [ ] Check phone - receive SMS with OTP

### Staff Workflow
- [ ] Go to Staff Dashboard
- [ ] See new order appear
- [ ] Click "Start Preparing"
- [ ] Status changes to PREPARING
- [ ] Click "Mark Ready (& Call)"
- [ ] Status changes to READY
- [ ] Phone receives automated call
- [ ] OTP input field appears
- [ ] Enter OTP from SMS
- [ ] Click "Complete"
- [ ] Status changes to COMPLETED
- [ ] Success message appears

## ✅ Data Verification

### Prisma Studio Check
```powershell
cd apps/api
npx prisma studio
```

- [ ] Opens in browser at http://localhost:5555
- [ ] Can see all tables
- [ ] Store table has "Downtown Cafe"
- [ ] MenuItem table has 6 items
- [ ] Order table has your test order(s)
- [ ] Order has profit metrics filled:
  - [ ] stripeFeeCents
  - [ ] commCostCents
  - [ ] grossProfitCents
  - [ ] netProfitCents
- [ ] Payment table has payment record
- [ ] CallLog table has call record (if call succeeded)

## ✅ Production Readiness

### Security
- [ ] Changed OTP_SECRET_PEPPER from default
- [ ] Changed STAFF_PASSWORD from default
- [ ] Using HTTPS in production
- [ ] Stripe production keys (not test keys)
- [ ] Twilio production credentials
- [ ] Environment variables secured (not in git)

### Database
- [ ] Using managed PostgreSQL (not local Docker)
- [ ] Connection pooling configured
- [ ] Regular backups scheduled
- [ ] SSL/TLS enabled for connections

### Webhooks
- [ ] Stripe webhook endpoint configured in dashboard
- [ ] Webhook secret from production
- [ ] Twilio voice URL configured: `https://yourdomain.com/api/twilio/voice/order-ready`
- [ ] Twilio status callback: `https://yourdomain.com/api/twilio/voice/status`

### Monitoring
- [ ] Error logging configured
- [ ] Uptime monitoring set up
- [ ] Alert system for failures
- [ ] Performance monitoring enabled

### Documentation
- [ ] Updated README with production URLs
- [ ] Documented any custom configurations
- [ ] Created runbook for common issues
- [ ] Team trained on staff dashboard

## 🚨 Common Issues

### Issue: "Cannot connect to database"
**Fix**: 
1. Check Docker is running: `docker ps`
2. Restart PostgreSQL: `docker-compose restart`
3. Verify DATABASE_URL in .env

### Issue: "Stripe webhook signature verification failed"
**Fix**: 
1. Ensure Stripe CLI is running
2. Copy the EXACT webhook secret from Stripe CLI output
3. Update STRIPE_WEBHOOK_SECRET in .env
4. Restart backend

### Issue: "SMS not received"
**Fix**: 
1. Check Twilio credentials in .env
2. Verify phone number format: +12025551234
3. For trial accounts, verify recipient in Twilio console
4. Check Twilio logs in console for errors

### Issue: "Call not made"
**Fix**: 
1. Ensure customer checked "consent to calls"
2. Verify TWILIO_FROM_NUMBER format
3. Check BASE_URL is accessible (for TwiML)
4. Review Twilio call logs

### Issue: "Frontend can't reach API"
**Fix**: 
1. Check backend is running on port 3001
2. Verify NEXT_PUBLIC_API_URL in web/.env or next.config.js
3. Check CORS settings in backend
4. Look at browser console for errors

### Issue: "OTP verification always fails"
**Fix**: 
1. Check OTP_SECRET_PEPPER hasn't changed
2. Verify OTP hasn't expired (60 min limit)
3. Check attempts counter (5 max)
4. Try resending OTP

## ✅ Final Checks

Before considering setup complete:
- [ ] Can browse menu
- [ ] Can add items to cart
- [ ] Can checkout and redirect to Stripe
- [ ] Can complete payment
- [ ] Receive SMS with OTP
- [ ] Can login to staff dashboard
- [ ] Can see orders in dashboard
- [ ] Can update order status
- [ ] Receive automated call when marking ready
- [ ] Can complete order with OTP
- [ ] Profit metrics calculate correctly
- [ ] No errors in any terminal

## 🎉 Success!

If all checks pass:
✅ **Your QR ordering system is ready!**

Next steps:
1. Customize your store (name, menu items, branding)
2. Generate QR codes for your store URL
3. Test with real customers (small group first)
4. Monitor for issues
5. Deploy to production when ready

---

**Need help? Check:**
- README.md for setup details
- TESTING.md for comprehensive tests
- QUICK_REFERENCE.md for commands
- ARCHITECTURE.md for system design

**Having issues? Review the "Common Issues" section above or check logs in each terminal.**

---

**Keep this checklist for future reference when setting up on new machines or onboarding team members!**
