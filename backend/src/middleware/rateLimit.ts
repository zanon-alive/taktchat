import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Middleware simples de rate limit baseado em memória.
 * Limpa entradas expiradas periodicamente.
 */
export const rateLimit = (maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) => {
  // Limpar entradas expiradas a cada 5 minutos
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = store[key];

    if (!entry || entry.resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (entry.count >= maxRequests) {
      return next(new AppError("Muitas tentativas. Tente novamente mais tarde.", 429));
    }

    entry.count++;
    next();
  };
};
