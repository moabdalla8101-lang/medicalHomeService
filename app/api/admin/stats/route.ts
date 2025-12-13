import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedDummyProviders } from '@/lib/seedData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // Check if this is a seed request
    if (body.action === 'seed') {
      const existingProviders = db.getAllProviders();
      
      if (existingProviders.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Dummy data already exists',
          providersCount: existingProviders.length,
        });
      }

      seedDummyProviders();
      const providers = db.getAllProviders();
      
      return NextResponse.json({
        success: true,
        message: 'Dummy data seeded successfully',
        providersCount: providers.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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
    
    const allProviders = db.getAllProviders();
    const pendingProviders = allProviders.filter(p => p.status === 'pending');
    
    const allBookings = Array.from((db as any).bookings.values());
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = allBookings.filter((b: any) => 
      b.scheduledDate === today || (b.type === 'emergency' && new Date(b.createdAt).toISOString().split('T')[0] === today)
    );
    
    const todayRevenue = todayBookings
      .filter((b: any) => b.paymentStatus === 'paid')
      .reduce((sum: number, b: any) => sum + b.platformCommission, 0);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProviders: allProviders.length,
        pendingProviders: pendingProviders.length,
        totalBookings: allBookings.length,
        todayRevenue,
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

