import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const allBookings = Array.from((db as any).bookings.values());
    
    return NextResponse.json({
      success: true,
      bookings: allBookings
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((b: any) => ({
          id: b.id,
          status: b.status,
          type: b.type,
          service: b.service.name,
          totalPrice: b.totalPrice,
          commission: b.platformCommission,
          scheduledDate: b.scheduledDate,
          scheduledTime: b.scheduledTime,
          address: b.address,
          createdAt: b.createdAt,
        })),
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

