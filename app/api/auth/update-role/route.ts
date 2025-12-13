import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateRoleSchema = z.object({
  role: z.enum(['user', 'provider', 'admin']),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);
    
    // In development, allow role updates for testing
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Role updates only allowed in development' },
        { status: 403 }
      );
    }
    
    // Update user role
    const updated = db.updateUser(user.id, { role });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }
    
    // Generate new token with updated role
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const newToken = jwt.sign(
      {
        userId: updated.id,
        phone: updated.phone,
        role: updated.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update session
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);
    db.updateUser(updated.id, {
      sessionToken: newToken,
      sessionExpiry,
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        phone: updated.phone,
        role: updated.role,
        name: updated.name,
      },
      token: newToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

