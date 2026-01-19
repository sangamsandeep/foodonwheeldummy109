import crypto from 'crypto';
import { env } from '../config/env';

export function generateOTP(): string {
  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}

export function hashOTP(otp: string): string {
  return crypto
    .createHmac('sha256', env.OTP_SECRET_PEPPER)
    .update(otp)
    .digest('hex');
}

export function verifyOTP(otp: string, hash: string): boolean {
  const otpHash = hashOTP(otp);
  return crypto.timingSafeEqual(Buffer.from(otpHash), Buffer.from(hash));
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 60); // 60 minutes from now
  return expiry;
}
