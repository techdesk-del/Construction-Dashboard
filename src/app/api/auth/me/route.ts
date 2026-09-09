import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase, memoryStore } from '@/lib/db';
import UserModel from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Try MongoDB
    const db = await connectToDatabase();
    if (db) {
      const user = await UserModel.findOne({ email: decoded.email.toLowerCase() }).select('-password');
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || (user.role.includes('CEO') ? '👔' : '👷‍♂️'),
          },
        });
      }
    }

    // Fallback in-memory
    const memUser = memoryStore.findUserByEmail(decoded.email.toLowerCase());
    if (memUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          avatar: memUser.avatar || '👤',
        },
      });
    }

    // Return decoded token data if user found
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.role?.includes('CEO') ? '👔' : '👷‍♂️',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
