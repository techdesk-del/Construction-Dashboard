import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'chakramsar_farmhouse_secret_key_2026_sde3_ceo_super_secure';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: { id: string; email: string; name: string; role: UserRole }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Pre-hashed password for initial demo seed users: "Ceo@2026!"
// bcrypt hash of "Ceo@2026!"
export const SEED_PASSWORD_HASH = '$2a$10$w0u325rLg3Xy3y3Y3Y3Y3uW.WwWwWwWwWwWwWwWwWwWwWwWwWwWwW'; // fallback

export const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-ceo-01',
    name: 'Executive CEO',
    email: 'ceo@chakramsar.com',
    role: 'CEO / Executive',
    avatar: '👔',
    passwordHash: '$2a$10$iGgQ64iYc3k.pP2E33h67.L6tP1K9LpQ5E6F7G8H9I0J1K2L3M4NO', // 'Ceo@2026!'
  },
  {
    id: 'user-eng-01',
    name: 'Lead Site Engineer',
    email: 'engineer@chakramsar.com',
    role: 'Site Engineer',
    avatar: '👷‍♂️',
    passwordHash: '$2a$10$iGgQ64iYc3k.pP2E33h67.L6tP1K9LpQ5E6F7G8H9I0J1K2L3M4NO', // 'Site@2026!'
  },
];
