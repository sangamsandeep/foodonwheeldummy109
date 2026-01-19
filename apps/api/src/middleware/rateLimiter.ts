import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour per IP
  message: { error: 'Too many OTP attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});
