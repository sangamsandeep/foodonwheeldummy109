# Helper script to get Store ID for Staff Dashboard

Write-Host "🔍 Getting Store Information..." -ForegroundColor Cyan
Write-Host ""

# Change to API directory
Set-Location apps/api

# Run a simple script to query the database
$query = @"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany();
  
  if (stores.length === 0) {
    console.log('❌ No stores found. Run: npm run seed');
    return;
  }
  
  console.log('📍 Available Stores:\n');
  
  for (const store of stores) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Name:', store.name);
    console.log('Slug:', store.slug);
    console.log('Store ID:', store.id);
    console.log('URL: http://localhost:3000/store/' + store.slug);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  console.log('💡 Use the Store ID above to login to Staff Dashboard');
  console.log('   Staff Dashboard: http://localhost:3000/staff');
  console.log('   Password: Check STAFF_PASSWORD in .env (default: admin123)\n');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.\$disconnect());
"@

# Create temp file
$query | Out-File -FilePath "temp-get-stores.mjs" -Encoding utf8

# Run it
Write-Host "Fetching store information..." -ForegroundColor Yellow
npx tsx temp-get-stores.mjs

# Clean up
Remove-Item "temp-get-stores.mjs"

Set-Location ../..

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
