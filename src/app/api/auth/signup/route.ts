import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import UserModel from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole: UserRole = role || 'Site Engineer';
    const hashedPassword = await hashPassword(password);
    const avatar = cleanRole.includes('CEO') ? '👔' : cleanRole.includes('Engineer') ? '👷‍♂️' : '👤';

    // 1. Try MongoDB
    const db = await connectToDatabase();
    if (db) {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Account with this email already exists' }, { status: 400 });
      }

      const newUser = await UserModel.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: cleanRole,
        avatar,
      });

      const token = signToken({
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });

      const userProfile = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
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

    // 2. Fallback in-memory
    if (memoryStore.findUserByEmail(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Account with this email already exists' }, { status: 400 });
    }

    const created = memoryStore.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: cleanRole,
      avatar,
    });

    const token = signToken({
      id: created.id || 'mem-user',
      email: created.email,
      name: created.name,
      role: created.role,
    });

    const response = NextResponse.json({ success: true, user: created });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
