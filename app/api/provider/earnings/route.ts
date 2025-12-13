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
    const config = db.getSystemConfig();
    
    const completedBookings = bookings.filter(b => 
      b.status === 'completed' && b.paymentStatus === 'paid'
    );
    
    const total = completedBookings.reduce((sum, b) => sum + b.providerEarnings, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthEarnings = completedBookings
      .filter(b => new Date(b.completedAt || b.createdAt) >= thisMonth)
      .reduce((sum, b) => sum + b.providerEarnings, 0);
    
    const pending = bookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + b.providerEarnings, 0);
    
    const totalCommission = completedBookings.reduce((sum, b) => sum + b.platformCommission, 0);
    
    // Recent transactions (last 10)
    const recent = completedBookings
      .slice(0, 10)
      .map(b => ({
        description: `Booking #${b.id.slice(0, 8)} - ${b.service.name}`,
        date: new Date(b.completedAt || b.createdAt).toLocaleDateString(),
        amount: b.providerEarnings,
      }));
    
    return NextResponse.json({
      success: true,
      earnings: {
        total,
        thisMonth: thisMonthEarnings,
        pending,
        commissionPercent: config.platformCommissionPercent,
        totalCommission,
        recent,
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

