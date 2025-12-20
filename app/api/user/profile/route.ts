import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only regular users can access this endpoint' },
        { status: 403 }
      );
    }
    
    // Get user bookings to extract unique addresses
    const bookings = await db.getUserBookings(user.id);
    const uniqueAddresses = Array.from(
      new Set(bookings.map(b => b.address).filter(Boolean))
    );
    
    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        phone: user.phone,
        name: user.name || '',
        addresses: uniqueAddresses,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only regular users can update their profile' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name } = updateProfileSchema.parse(body);
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const updated = await db.updateUser(user.id, { name });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        phone: updated.phone,
        name: updated.name || '',
      },
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
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

