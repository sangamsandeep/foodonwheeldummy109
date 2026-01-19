# Deployment Guide: Vercel + Railway

This guide covers deploying the QR Ordering System to **Vercel** (frontend) and **Railway** (backend + database).

## Prerequisites

- GitHub account (already set up ✓)
- Vercel account (free at https://vercel.com)
- Railway account (free at https://railway.app)
- Stripe account with live keys
- Twilio account with live credentials

## Part 1: Railway Setup (Backend + Database)

### 1. Create Railway Project

1. Go to https://railway.app and sign in
2. Click "Create New Project" → Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub account
4. Select `sangamsandeep/foodonwheelstrails`
5. Railway will auto-detect it's a monorepo and offer to add PostgreSQL

### 2. Add PostgreSQL Database

1. In Railway, click "+ Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a free PostgreSQL instance

### 3. Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

```
DATABASE_URL=<Auto-populated by Railway PostgreSQL plugin>
NODE_ENV=production
PORT=3001
BASE_URL=https://<your-railway-domain>.railway.app
FRONTEND_URL=https://<your-vercel-domain>.vercel.app

STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

OTP_SECRET_PEPPER=<generate random 32-char string>
STAFF_PASSWORD=<set strong password>

NEXT_PUBLIC_API_URL=https://<your-railway-domain>.railway.app
```

### 4. Deploy API

1. Railway should auto-detect Node.js
2. Set **Start Command** to: `cd apps/api && npm run build && npm start`
3. Click "Deploy"
4. Wait for build to complete
5. Note the Railway URL (e.g., `https://qr-api.railway.app`)

### 5. Run Database Migrations

Once deployed, run migrations via Railway CLI or dashboard:

```bash
# Via Railway CLI
railway run prisma migrate deploy
railway run npm run seed
```

Or use Railway web terminal:
- Click into the PostgreSQL service
- Use the shell to run `prisma migrate deploy`

---

## Part 2: Vercel Setup (Frontend)

### 1. Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "New Project"
3. Select `sangamsandeep/foodonwheelstrails` repository
4. **Framework Preset**: Next.js (should auto-detect)
5. **Build Command**: `npm run build` (uses root scripts)
6. **Output Directory**: `apps/web/.next`
7. **Install Command**: `npm install`

### 2. Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>
```

### 3. Deploy

Click "Deploy" and wait for build to complete.

---

## Part 3: Webhook Configuration

### Stripe Webhook (in Railway)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://<railway-api-url>/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `charge.succeeded`
4. Copy webhook signing secret to Railway env var `STRIPE_WEBHOOK_SECRET`

### Twilio Configuration

1. Update Twilio webhook URL in Twilio console
2. Point to: `https://<railway-api-url>/api/twilio/webhook`

---

## Part 4: Testing Production

1. Visit your Vercel URL
2. Scan QR code
3. Add items to cart
4. Proceed to checkout
5. Use Stripe test card (in test mode) or live card (in production)

---

## Troubleshooting

### Database connection errors
- Check `DATABASE_URL` is set correctly in Railway
- Run `railway run prisma migrate deploy` to setup schema
- Check PostgreSQL service is running

### API 500 errors
- Check Railway logs: Dashboard → Project → Deployments
- Verify all required env vars are set
- Check Stripe/Twilio credentials are valid

### Frontend can't reach API
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS is enabled in API (`BASE_URL` env var matches)
- Check API is actually running on Railway

### Image loading errors
- Verify `loremflickr.com` is accessible from your region
- Check Next.js image config in `apps/web/next.config.js`

---

## Useful Commands

```bash
# View Railway logs
railway logs

# Run commands on deployed app
railway run npm run seed

# Check deployed environment
railway variables

# View Vercel logs
vercel logs

# Redeploy
vercel --prod
```

---

## Cost Estimate

- **Vercel**: Free tier (frontend)
- **Railway**: ~$5-10/month (backend + PostgreSQL)
- **Stripe**: 2.9% + $0.30 per transaction
- **Twilio**: ~$0.01-0.02 per SMS/call

**Total**: ~$5-20/month depending on usage

---

## Next Steps

1. Set up custom domain
2. Add SSL certificate
3. Configure backups for PostgreSQL
4. Set up monitoring/alerts
5. Add customer support chat
