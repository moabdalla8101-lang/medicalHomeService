import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const medicalCentreId = user.medicalCentreId;
    
    // Get all providers for this medical centre
    const allProviders = await db.getAllProviders();
    const centreProviders = allProviders.filter(p => p.medicalCentreId === medicalCentreId);
    
    // Get all bookings for providers in this centre
    const allBookings = await db.getAllBookings();
    const centreBookings = allBookings.filter(b => 
      centreProviders.some(p => p.id === b.providerId)
    );
    
    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = centreBookings.filter(b => {
      const bookingDate = b.scheduledDate ? new Date(b.scheduledDate) : new Date(b.createdAt);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });
    
    const pendingBookings = centreBookings.filter(b => 
      ['requested', 'confirmed', 'assigned'].includes(b.status)
    );
    
    const completedBookings = centreBookings.filter(b => b.status === 'completed');
    
    // Calculate revenue
    const totalRevenue = centreBookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const monthlyRevenue = centreBookings
      .filter(b => {
        if (b.status !== 'completed' || b.paymentStatus !== 'paid') return false;
        const bookingDate = b.completedAt || new Date(b.createdAt);
        const bookingMonth = bookingDate.getMonth();
        const bookingYear = bookingDate.getFullYear();
        return bookingMonth === today.getMonth() && bookingYear === today.getFullYear();
      })
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Get provider performance
    const providerStats = centreProviders.map(provider => {
      const providerBookings = centreBookings.filter(b => b.providerId === provider.id);
      const providerRevenue = providerBookings
        .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      return {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        totalBookings: providerBookings.length,
        completedBookings: providerBookings.filter(b => b.status === 'completed').length,
        revenue: providerRevenue,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
      };
    });
    
    // Get recent bookings (last 10)
    const recentBookings = centreBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(booking => ({
        id: booking.id,
        providerName: centreProviders.find(p => p.id === booking.providerId)?.name || 'Unknown',
        serviceName: booking.service?.name || 'Unknown Service',
        status: booking.status,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
      }));
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProviders: centreProviders.length,
          totalBookings: centreBookings.length,
          todayBookings: todayBookings.length,
          pendingBookings: pendingBookings.length,
          completedBookings: completedBookings.length,
          totalRevenue,
          monthlyRevenue,
        },
        providerStats,
        recentBookings,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching medical centre dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}


