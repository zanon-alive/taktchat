import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export type RateLimitStore = Record<string, RateLimitEntry>;

/**
 * Retorna true se a requisição está dentro do limite; false se deve ser bloqueada (429).
 */
export const hitRateLimit = (
  store: RateLimitStore,
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number = Date.now()
): boolean => {
  const entry = store[key];

  if (!entry || entry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
};

const ipStore: RateLimitStore = {};
const userStore: RateLimitStore = {};

let cleanupStarted = false;
const startCleanup = () => {
  if (cleanupStarted) return;
  if (process.env.NODE_ENV === "test") return;
  cleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    [ipStore, userStore].forEach(store => {
      Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
          delete store[key];
        }
      });
    });
  }, 5 * 60 * 1000);
};

/**
 * Middleware simples de rate limit baseado em memória (chave = IP).
 */
export const rateLimit = (maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) => {
  startCleanup();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    if (!hitRateLimit(ipStore, key, maxRequests, windowMs)) {
      return next(new AppError("Muitas tentativas. Tente novamente mais tarde.", 429));
    }
    next();
  };
};

/**
 * Rate limit por usuário autenticado (não pune NAT da empresa).
 */
export const rateLimitByUser = (
  maxRequests: number = 20,
  windowMs: number = 15 * 60 * 1000
) => {
  startCleanup();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(new AppError("ERR_SESSION_EXPIRED", 401));
    }
    const key = `user:${userId}`;
    if (!hitRateLimit(userStore, key, maxRequests, windowMs)) {
      return next(new AppError("ERR_TICKET_HIDE_RATE_LIMIT", 429));
    }
    next();
  };
};
