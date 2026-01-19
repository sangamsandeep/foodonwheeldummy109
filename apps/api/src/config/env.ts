import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER!,
  
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  OTP_SECRET_PEPPER: process.env.OTP_SECRET_PEPPER!,
  STAFF_PASSWORD: process.env.STAFF_PASSWORD || 'admin123',
};

// Validate required env vars
const requiredEnvVars = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
  'OTP_SECRET_PEPPER',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
