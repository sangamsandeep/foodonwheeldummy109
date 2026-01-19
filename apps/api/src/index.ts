import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { generalRateLimiter } from './middleware/rateLimiter';

// Import routes
import storesRouter from './routes/stores';
import checkoutRouter from './routes/checkout';
import ordersRouter from './routes/orders';
import staffRouter from './routes/staff';
import stripeRouter from './routes/stripe';
import twilioRouter from './routes/twilio';

const app = express();

// Honor X-Forwarded-* headers when behind proxies (Railway/Ingress)
// This is required so express-rate-limit sees the real client IP.
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
app.use(generalRateLimiter);

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/stores', storesRouter);
app.use('/api/checkout-session', checkoutRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/staff', staffRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/twilio', twilioRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on ${env.BASE_URL}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});

export default app;
