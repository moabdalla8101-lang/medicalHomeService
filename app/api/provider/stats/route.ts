import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can access this endpoint' },
        { status: 403 }
      );
    }
    
    const profile = db.getProviderProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const bookings = db.getProviderBookings(profile.id);
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = bookings.filter(b => 
      b.scheduledDate === today && b.status !== 'cancelled'
    ).length;
    
    const pendingBookings = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'requested'
    ).length;
    
    const totalEarnings = bookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.providerEarnings, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyEarnings = bookings
      .filter(b => 
        b.status === 'completed' && 
        b.paymentStatus === 'paid' &&
        new Date(b.completedAt || b.createdAt) >= thisMonth
      )
      .reduce((sum, b) => sum + b.providerEarnings, 0);
    
    return NextResponse.json({
      success: true,
      stats: {
        todayBookings,
        pendingBookings,
        totalEarnings,
        monthlyEarnings,
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

