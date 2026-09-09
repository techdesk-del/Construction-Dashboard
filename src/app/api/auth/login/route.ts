import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import UserModel from '@/models/User';
import { comparePassword, signToken, hashPassword } from '@/lib/auth';
import { rateLimit, getClientIp, sanitizeInput } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 10 login attempts per 5 minutes per IP)
    const clientIp = getClientIp(req);
    const rl = rateLimit(`login:${clientIp}`, 10, 5 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. For security reasons, please wait 5 minutes before trying again.' 
        },
        { 
          status: 429,
          headers: { 'Retry-After': '300' }
        }
      );
    }

    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try MongoDB
    const db = await connectToDatabase();
    if (db) {
      // Check if users exist in MongoDB, if not seed the demo CEO and Engineer
      const count = await UserModel.countDocuments();
      if (count === 0) {
        const ceoHash = await hashPassword('Ceo@2026!');
        const engHash = await hashPassword('Site@2026!');
        await UserModel.create([
          { name: 'Executive CEO', email: 'ceo@chakramsar.com', password: ceoHash, role: 'CEO / Executive', avatar: '👔' },
          { name: 'Lead Site Engineer', email: 'engineer@chakramsar.com', password: engHash, role: 'Site Engineer', avatar: '👷‍♂️' },
        ]);
      }

      const user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid credentials. User not found.' }, { status: 401 });
      }

      let isMatch = false;
      if (user.password) {
        try {
          isMatch = await comparePassword(password, user.password);
        } catch {
          isMatch = false;
        }
      }
      if (!isMatch) {
        // Special check for demo credentials
        if ((cleanEmail === 'ceo@chakramsar.com' && password === 'Ceo@2026!') ||
            (cleanEmail === 'engineer@chakramsar.com' && password === 'Site@2026!')) {
          isMatch = true;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const userProfile = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || (user.role.includes('CEO') ? '👔' : '👷‍♂️'),
      };

      const response = NextResponse.json({ success: true, user: userProfile });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // 2. Fallback in-memory authentication
    const user = memoryStore.findUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = (password === 'Ceo@2026!' && cleanEmail === 'ceo@chakramsar.com') ||
                    (password === 'Site@2026!' && cleanEmail === 'engineer@chakramsar.com') ||
                    (user.password && (await comparePassword(password, user.password)));

    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({
      id: user.id || 'mem-user',
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '👤',
    };

    const response = NextResponse.json({ success: true, user: userProfile });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
