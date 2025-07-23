// Express Request interface extensions for Connectouch platform
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
      user?: {
        id: string;
        email: string;
        username: string;
        walletAddress?: string;
      };
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

export {};
