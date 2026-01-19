# QR Ordering System - Quick Setup Script for Windows
# Run this script from the project root directory

Write-Host "🚀 QR Ordering System - Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your:" -ForegroundColor Red
    Write-Host "   - Stripe keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)" -ForegroundColor Red
    Write-Host "   - Twilio credentials (SID, AUTH_TOKEN, FROM_NUMBER)" -ForegroundColor Red
    Write-Host "   - Change OTP_SECRET_PEPPER to a random string" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Press Enter when you've updated .env, or Ctrl+C to exit"
}

Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location apps/api
npm install

Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../web
npm install
Set-Location ../..

Write-Host ""
Write-Host "🐳 Starting PostgreSQL with Docker..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting 10 seconds for PostgreSQL to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Set-Location apps/api
npx prisma migrate dev --name init

Write-Host ""
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
npx prisma db seed

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Stripe webhook forwarding (new terminal):" -ForegroundColor White
Write-Host "   stripe listen --forward-to http://localhost:3001/api/stripe/webhook" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy the webhook secret (whsec_...) to .env STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host ""
Write-Host "3. Start the backend (new terminal):" -ForegroundColor White
Write-Host "   cd apps/api" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the frontend (new terminal):" -ForegroundColor White
Write-Host "   cd apps/web" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open http://localhost:3000/store/downtown-cafe" -ForegroundColor White
Write-Host ""
Write-Host "📊 To get Store ID for staff dashboard:" -ForegroundColor Cyan
Write-Host "   cd apps/api" -ForegroundColor Gray
Write-Host "   npx prisma studio" -ForegroundColor Gray
Write-Host ""

Set-Location ../..
