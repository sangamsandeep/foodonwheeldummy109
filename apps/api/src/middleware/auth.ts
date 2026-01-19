import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function staffAuth(req: Request, res: Response, next: NextFunction) {
  const password = req.headers['x-staff-password'] as string;
  
  if (!password || password !== env.STAFF_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}
