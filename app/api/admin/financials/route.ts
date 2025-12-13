import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
    const config = db.getSystemConfig();
    
    const completedBookings = allBookings.filter((b: any) => 
      b.status === 'completed' && b.paymentStatus === 'paid'
    );
    
    const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
    const totalCommission = completedBookings.reduce((sum: number, b: any) => sum + b.platformCommission, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthRevenue = completedBookings
      .filter((b: any) => new Date(b.completedAt || b.createdAt) >= thisMonth)
      .reduce((sum: number, b: any) => sum + b.platformCommission, 0);
    
    const standardBookings = completedBookings.filter((b: any) => b.type === 'standard').length;
    const emergencyBookings = completedBookings.filter((b: any) => b.type === 'emergency').length;
    
    return NextResponse.json({
      success: true,
      financials: {
        totalRevenue,
        totalCommission,
        thisMonth: thisMonthRevenue,
        commissionPercent: config.platformCommissionPercent,
        standardBookings,
        emergencyBookings,
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

