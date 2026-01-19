# QR Ordering System - Quick Reference

## 🚀 Start Everything (for development)

### Terminal 1: PostgreSQL
```powershell
docker-compose up
```

### Terminal 2: Stripe Webhooks
```powershell
stripe listen --forward-to http://localhost:3001/api/stripe/webhook
```
> Copy the `whsec_...` secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### Terminal 3: Backend API
```powershell
cd apps/api
npm run dev
```
> Runs on http://localhost:3001

### Terminal 4: Frontend
```powershell
cd apps/web
npm run dev
```
> Runs on http://localhost:3000

## 📍 Key URLs

- **Customer Menu**: http://localhost:3000/store/downtown-cafe
- **Staff Dashboard**: http://localhost:3000/staff
- **Home Page**: http://localhost:3000
- **API Health**: http://localhost:3001/health
- **Prisma Studio**: Run `cd apps/api && npx prisma studio`

## 🔑 Test Credentials

### Staff Dashboard
- **Store ID**: Get from Prisma Studio or seed output
- **Password**: `admin123` (from `.env`)

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Any future expiry date, any CVC, any postal code

### Phone Numbers
- Use E.164 format: `+12025551234`
- For Twilio trial: use verified numbers only

## 🔧 Common Commands

### Database
```powershell
cd apps/api

# View database in browser
npx prisma studio

# Reset database (deletes all data!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name description

# Seed data
npx prisma db seed
```

### Run Tests
```powershell
# Test checkout flow with curl
curl http://localhost:3001/health

# Check menu API
curl http://localhost:3001/api/stores/downtown-cafe/menu
```

## 📊 Order Flow

1. **Customer**: Browse menu → Add to cart → Enter phone → Pay
2. **System**: Process payment → Generate OTP → Send SMS
3. **Staff**: See new order → Mark "Preparing" → Mark "Ready" (calls customer)
4. **Customer**: Arrives with OTP
5. **Staff**: Enter OTP → Complete order

## 🔍 Debugging

### Can't connect to database?
```powershell
docker ps                    # Check if PostgreSQL is running
docker-compose restart       # Restart PostgreSQL
```

### Stripe webhook not working?
- Ensure Stripe CLI is running
- Check `STRIPE_WEBHOOK_SECRET` in `.env`
- Verify backend is on port 3001

### SMS/Call not working?
- Check Twilio credentials in `.env`
- Verify phone number is E.164 format
- For trial: verify recipient number in Twilio console

### Frontend can't reach API?
- Check `NEXT_PUBLIC_API_URL` (should be http://localhost:3001)
- Ensure backend is running
- Check browser console for CORS errors

## 💰 Profit Metrics

Each order tracks:
- **Gross Profit** = Revenue - Item Costs
- **Stripe Fee** = (Total × 2.9%) + $0.30
- **Comm Costs** = SMS (1¢) + Call (1¢)
- **Net Profit** = Gross - Stripe Fee - Comm Costs

View reports:
- Daily: `GET /api/staff/reports/daily?storeId=X&date=2026-01-18`
- Items: `GET /api/staff/reports/items?storeId=X&dateFrom=2026-01-01&dateTo=2026-01-31`

## 📱 Customer Experience

1. Scan QR code (opens `/store/downtown-cafe`)
2. Browse menu, add items to cart
3. Enter phone number with country code
4. Check consent boxes for SMS/calls
5. Optional: Add tip
6. Click "Proceed to Payment"
7. Pay with Stripe (redirects to Stripe Checkout)
8. Receive SMS with 6-digit OTP
9. Track order status
10. Get called when order ready
11. Arrive and provide OTP to staff

## 🛠️ Staff Dashboard Features

- **Login**: Store ID + Password
- **View Orders**: Filter by status
- **Update Status**: 
  - PLACED → PREPARING (start cooking)
  - PREPARING → READY (auto-calls customer)
- **Complete Order**: Enter customer's OTP
- **Resend OTP**: If customer didn't receive
- **Real-time Updates**: Dashboard shows latest orders

## 🎯 Production Deployment Checklist

- [ ] Set strong `OTP_SECRET_PEPPER`
- [ ] Set strong `STAFF_PASSWORD`
- [ ] Use production Stripe keys
- [ ] Use production Twilio credentials
- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL
- [ ] Configure Stripe webhook endpoint
- [ ] Configure Twilio webhook endpoints
- [ ] Enable HTTPS
- [ ] Set up proper authentication for staff
- [ ] Configure rate limiting
- [ ] Set up error monitoring
- [ ] Set up logging

## 📞 Support

- **Stripe Docs**: https://stripe.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Happy ordering! 🍕🍔🍜**
