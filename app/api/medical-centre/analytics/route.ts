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
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // 'week', 'month', 'year'
    
    // Get all providers for this medical centre
    const allProviders = await db.getAllProviders();
    const centreProviders = allProviders.filter(p => p.medicalCentreId === medicalCentreId);
    
    // Get all bookings for providers in this centre
    const allBookings = await db.getAllBookings();
    const centreBookings = allBookings.filter(b => 
      centreProviders.some(p => p.id === b.providerId)
    );
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Filter bookings by period
    const periodBookings = centreBookings.filter(b => {
      const bookingDate = b.completedAt || b.createdAt;
      return bookingDate >= startDate;
    });
    
    // Revenue trends (daily for week, weekly for month, monthly for year)
    const revenueTrends = [];
    const completedBookings = periodBookings.filter(b => 
      b.status === 'completed' && b.paymentStatus === 'paid'
    );
    
    if (period === 'week') {
      // Daily revenue for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayRevenue = completedBookings
          .filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= date && bookingDate < nextDate;
          })
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        revenueTrends.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          bookings: completedBookings.filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= date && bookingDate < nextDate;
          }).length,
        });
      }
    } else if (period === 'month') {
      // Weekly revenue for last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekRevenue = completedBookings
          .filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= weekStart && bookingDate < weekEnd;
          })
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        revenueTrends.push({
          week: `Week ${4 - i}`,
          startDate: weekStart.toISOString().split('T')[0],
          revenue: weekRevenue,
          bookings: completedBookings.filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= weekStart && bookingDate < weekEnd;
          }).length,
        });
      }
    } else {
      // Monthly revenue for last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now);
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        
        const monthRevenue = completedBookings
          .filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= monthStart && bookingDate < monthEnd;
          })
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        revenueTrends.push({
          month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
          startDate: monthStart.toISOString().split('T')[0],
          revenue: monthRevenue,
          bookings: completedBookings.filter(b => {
            const bookingDate = b.completedAt || b.createdAt;
            return bookingDate >= monthStart && bookingDate < monthEnd;
          }).length,
        });
      }
    }
    
    // Service category breakdown
    const serviceBreakdown: Record<string, { count: number; revenue: number }> = {};
    completedBookings.forEach(booking => {
      const category = booking.service?.category || 'other';
      if (!serviceBreakdown[category]) {
        serviceBreakdown[category] = { count: 0, revenue: 0 };
      }
      serviceBreakdown[category].count++;
      serviceBreakdown[category].revenue += booking.totalPrice;
    });
    
    // Provider performance
    const providerPerformance = centreProviders.map(provider => {
      const providerBookings = periodBookings.filter(b => b.providerId === provider.id);
      const providerCompleted = providerBookings.filter(b => b.status === 'completed');
      const providerRevenue = providerCompleted
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      return {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        totalBookings: providerBookings.length,
        completedBookings: providerCompleted.length,
        revenue: providerRevenue,
        averageBookingValue: providerCompleted.length > 0 
          ? providerRevenue / providerCompleted.length 
          : 0,
        rating: provider.rating,
      };
    }).sort((a, b) => b.revenue - a.revenue);
    
    // Status breakdown
    const statusBreakdown = {
      requested: centreBookings.filter(b => b.status === 'requested').length,
      confirmed: centreBookings.filter(b => b.status === 'confirmed').length,
      assigned: centreBookings.filter(b => b.status === 'assigned').length,
      on_the_way: centreBookings.filter(b => b.status === 'on_the_way').length,
      in_progress: centreBookings.filter(b => b.status === 'in_progress').length,
      completed: centreBookings.filter(b => b.status === 'completed').length,
      cancelled: centreBookings.filter(b => b.status === 'cancelled').length,
    };
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalBookings: periodBookings.length,
          completedBookings: completedBookings.length,
          totalRevenue: completedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
          averageBookingValue: completedBookings.length > 0
            ? completedBookings.reduce((sum, b) => sum + b.totalPrice, 0) / completedBookings.length
            : 0,
        },
        revenueTrends,
        serviceBreakdown,
        providerPerformance,
        statusBreakdown,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

