# Testing Guide - QR Ordering System

This guide walks through testing all features of the QR ordering system.

## Prerequisites

Ensure the following are running:
1. PostgreSQL (via Docker)
2. Backend API (port 3001)
3. Frontend (port 3000)
4. Stripe CLI webhook forwarding

## Test 1: Database Setup ✓

### Verify Database Connection
```powershell
cd apps/api
npx prisma studio
```

**Expected**: Prisma Studio opens in browser showing tables

### Check Seed Data
In Prisma Studio:
- Navigate to `Store` table
- Verify "Downtown Cafe" exists
- Copy the `id` field (UUID) - you'll need this for staff login
- Navigate to `MenuItem` table
- Verify 6 items exist (Espresso, Cappuccino, Latte, Croissant, Avocado Toast, Caesar Salad)

## Test 2: Menu Display ✓

### Access Store Page
```
http://localhost:3000/store/downtown-cafe
```

**Expected**:
- Page loads successfully
- Store name "Downtown Cafe" displayed
- All 6 menu items visible
- Each item shows name, description, price
- "Add to Cart" buttons work

### Test Cart Functionality
1. Click "Add to Cart" on Espresso
2. Click "Add to Cart" on Cappuccino (x2)
3. Cart should show:
   - Espresso: 1x $3.50
   - Cappuccino: 2x $5.00
   - Subtotal: $13.50
4. Click + to increase quantity
5. Click - to decrease quantity
6. Remove item by decreasing to 0

**Expected**: Cart updates immediately without page reload

## Test 3: Checkout Flow ✓

### Create Test Order
1. Add items to cart (e.g., 1 Latte, 1 Croissant)
2. Enter phone number: `+12025551234` (use your verified Twilio number for real SMS)
3. Check both consent boxes (SMS and Call)
4. Optional: Add tip (e.g., 2.00)
5. Click "Proceed to Payment"

**Expected**: Redirects to Stripe Checkout page

### Complete Payment
1. On Stripe Checkout page, verify:
   - Items and quantities are correct
   - Total matches (including tip)
2. Enter test card: `4242 4242 4242 4242`
3. Enter any future expiry: `12/34`
4. Enter any CVC: `123`
5. Click "Pay"

**Expected**:
- Payment succeeds
- Redirects to success page
- Success message displayed

### Check Webhook Processing
In the terminal running Stripe CLI, you should see:
```
✓ Received event checkout.session.completed
```

In the backend terminal, you should see:
```
✅ Order [number] processed successfully
```

### Verify SMS Sent
Check your phone for SMS:
```
Your pickup OTP for order #1 is 123456
```

**Note**: If using Twilio trial, ensure your phone number is verified in Twilio console.

## Test 4: Order Status Page ✓

After successful payment, you should have an order ID. Access it:
```
http://localhost:3000/order/[orderId]
```

**Expected**:
- Order details displayed
- Status shows "PLACED"
- Items list correct
- Total correct
- Last 4 digits of OTP shown (****1234)

**Auto-refresh**: Page polls every 10 seconds for status updates

## Test 5: Staff Dashboard ✓

### Login to Staff Dashboard
```
http://localhost:3000/staff
```

1. Enter Store ID (from Prisma Studio - Step 1)
2. Enter Password: `admin123` (or your STAFF_PASSWORD from .env)
3. Click "Login"

**Expected**: Dashboard loads with list of orders

### Verify Order Display
The order you just created should appear:
- Order number
- Customer phone
- Items list
- Status: PLACED
- Total amount

### Test Status Updates

#### Move to PREPARING
1. Click "Start Preparing" on your test order
2. Wait for success message

**Expected**:
- Status changes to PREPARING
- Button changes to "Mark Ready (& Call)"

#### Move to READY
1. Click "Mark Ready (& Call)"
2. Wait for success message

**Expected**:
- Status changes to READY
- If customer consented to calls, Twilio makes automated call
- Customer receives call: "Your order number X is ready for pickup. Thank you."
- OTP input field appears in dashboard

### Check Call Log
In Twilio console (https://console.twilio.com/):
- Navigate to Monitor → Logs → Calls
- Verify call was initiated
- Check call status (completed/busy/no-answer)

### Verify Call
If you used a real phone number:
- You should receive an automated call
- Voice should say: "Your order number 1 is ready for pickup. Thank you."

## Test 6: OTP Verification ✓

### Complete Order with Valid OTP
1. In Staff Dashboard, find the READY order
2. Enter the 6-digit OTP (from SMS)
3. Click "Complete"

**Expected**:
- Success message: "Order completed successfully!"
- Order status changes to COMPLETED
- OTP input field disappears

### Test Invalid OTP
1. Create another test order (repeat steps above)
2. Mark it as READY
3. Enter wrong OTP: `999999`
4. Click "Complete"

**Expected**:
- Error message: "Invalid OTP"
- Attempts remaining shown
- Order remains in READY status

### Test OTP Expiry
The OTP expires after 60 minutes. To test:
1. In Prisma Studio, find the order
2. Edit `pickupOtpExpiresAt` to a past date
3. Try to complete with OTP

**Expected**: Error message: "OTP has expired"

### Test OTP Rate Limiting
Try entering wrong OTP 5+ times in quick succession

**Expected**: After 5 attempts, error: "Too many OTP attempts"

### Test Resend OTP
1. Click "Resend OTP" button
2. Check phone for new SMS

**Expected**:
- Success message
- New OTP SMS received
- Attempts counter resets to 0

## Test 7: Profit Calculations ✓

### Verify Order Profit Metrics
In Prisma Studio, find your completed order:

Check these fields are populated:
- `stripeFeeCents`: Should be ~2.9% of total + 30
- `commCostCents`: ~2 (1 cent SMS + 1 cent call)
- `grossProfitCents`: Calculated correctly
- `netProfitCents`: Calculated correctly

### Example Calculation
Order: 1 Latte ($5.50) + 1 Croissant ($4.50) = $10.00

- Subtotal: 1000 cents
- Stripe Fee: (1000 × 0.029) + 30 = 59 cents
- Comm Cost: 2 cents
- Item Revenue: 1000 cents
- Item Cost: (130 + 150) = 280 cents
- Gross Profit: 1000 - 280 = 720 cents
- Net Profit: 720 - 59 - 2 = 659 cents

### Test Daily Report
Using curl or browser (replace STORE_ID and PASSWORD):

```powershell
curl -H "X-Staff-Password: admin123" "http://localhost:3001/api/staff/reports/daily?storeId=STORE_ID&date=2026-01-18"
```

**Expected JSON**:
```json
{
  "date": "2026-01-18",
  "orderCount": 1,
  "totalRevenueCents": 1000,
  "totalGrossProfitCents": 720,
  "totalNetProfitCents": 659,
  "totalStripeFeeCents": 59,
  "totalCommCostCents": 2
}
```

### Test Item Report
```powershell
curl -H "X-Staff-Password: admin123" "http://localhost:3001/api/staff/reports/items?storeId=STORE_ID&dateFrom=2026-01-01&dateTo=2026-01-31"
```

**Expected**: Array of items with quantity, revenue, cost, profit, margin%

## Test 8: Error Handling ✓

### Test Invalid Store Slug
```
http://localhost:3000/store/invalid-store
```

**Expected**: "Store not found" or error page

### Test Invalid Order ID
```
http://localhost:3000/order/invalid-uuid
```

**Expected**: "Order not found" or error message

### Test Unauthorized Staff Access
```powershell
curl -H "X-Staff-Password: wrongpassword" "http://localhost:3001/api/staff/orders?storeId=STORE_ID"
```

**Expected**: 401 Unauthorized error

### Test Invalid Phone Format
1. Go to store page
2. Add items to cart
3. Enter invalid phone: `1234567890` (missing +)
4. Try to checkout

**Expected**: Error: "Please enter a valid phone number in E.164 format"

### Test Stripe Payment Decline
1. Complete checkout flow
2. Use decline card: `4000 0000 0000 0002`

**Expected**: Stripe shows decline error

## Test 9: Real-World Scenario ✓

### Complete End-to-End Test
1. **Customer** scans QR (opens menu page)
2. **Customer** adds 2 Lattes, 1 Avocado Toast
3. **Customer** enters phone +1234567890
4. **Customer** checks consent boxes, adds $3 tip
5. **Customer** pays with Stripe
6. **System** sends OTP via SMS (check phone)
7. **Customer** sees success page and tracks order
8. **Staff** sees new order in dashboard (PLACED)
9. **Staff** clicks "Start Preparing"
10. **Staff** clicks "Mark Ready (& Call)"
11. **System** calls customer automatically
12. **Customer** arrives at pickup location
13. **Customer** provides 6-digit OTP to staff
14. **Staff** enters OTP and clicks "Complete"
15. **System** marks order COMPLETED
16. **Customer** order status page shows COMPLETED

**Expected**: All steps work smoothly without errors

## Test 10: Performance & Load ✓

### Create Multiple Orders
1. Create 5 different test orders
2. In Staff Dashboard, verify all appear
3. Test filtering by status
4. Update each order through workflow

**Expected**: Dashboard handles multiple orders without lag

### Test Concurrent Updates
Open Staff Dashboard in 2 browser windows:
1. Update order status in one window
2. Refresh other window

**Expected**: Changes reflected in both windows

## Common Issues & Solutions

### Issue: SMS not received
**Solution**: 
- Verify Twilio credentials
- Check phone number is verified (trial accounts)
- Check Twilio console for error logs

### Issue: Call not made
**Solution**:
- Verify customer consented to calls
- Check Twilio FROM_NUMBER is correct
- Ensure BASE_URL is set correctly for TwiML webhook

### Issue: Webhook not firing
**Solution**:
- Ensure Stripe CLI is running
- Check webhook secret matches .env
- Verify backend is accessible on port 3001

### Issue: OTP verification always fails
**Solution**:
- Check OTP_SECRET_PEPPER matches between attempts
- Verify OTP hasn't expired
- Check attempts counter < 5

### Issue: Profit metrics are null
**Solution**:
- Ensure webhook processed successfully
- Check Stripe session completed
- Verify calculateOrderProfit service is called

## Success Criteria Checklist

- [ ] Database connects and seeds successfully
- [ ] Menu page displays all items
- [ ] Cart updates correctly
- [ ] Stripe checkout session creates
- [ ] Payment webhook processes
- [ ] OTP SMS sends successfully
- [ ] Order status page works
- [ ] Staff can login to dashboard
- [ ] Staff can update order status
- [ ] Call is made when marking READY
- [ ] OTP verification works
- [ ] Order completes successfully
- [ ] Profit metrics calculate correctly
- [ ] Reports generate accurate data
- [ ] Error handling works as expected

## Performance Benchmarks

Expected response times (local dev):
- Menu API: < 100ms
- Create checkout: < 300ms
- Webhook processing: < 500ms
- Staff orders list: < 200ms
- OTP verification: < 100ms

If you see slower times, check:
- Database connection pool
- Network latency to Stripe/Twilio
- Large dataset (optimize queries)

---

**All tests passing? You're ready to deploy! 🚀**
