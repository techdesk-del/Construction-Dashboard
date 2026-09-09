import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { UserRole } from '@/types';

// ── 1. IN-MEMORY RATE LIMITER (Sliding Window) ──
interface RateLimitRecord {
  count: number;
  resetTime: number;
}



const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}



export function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, resetTime: record.resetTime };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

// ── 2. INPUT SANITIZATION (Anti-NoSQL Injection & XSS) ──
export function sanitizeInput<T>(data: T): T {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim() as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('$')) {
        continue;
      }
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj as T;
  }

  return data;
}

// ── 3. RBAC (Role-Based Access Control) GUARD ──
export const WRITE_ROLES: UserRole[] = ['CEO / Executive', 'Project Manager', 'Site Engineer'];

export function authenticateRequest(req: NextRequest): { authenticated: boolean; user: any | null } {
  const cookieToken = req.cookies.get('auth_token')?.value;
  let token = cookieToken;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return { authenticated: false, user: null };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user: payload };
}

export function authorizeRole(user: any | null, allowedRoles: UserRole[] = WRITE_ROLES): boolean {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}
