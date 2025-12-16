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
    const status = searchParams.get('status');
    const providerId = searchParams.get('providerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Get all providers for this medical centre
    const allProviders = await db.getAllProviders();
    const centreProviders = allProviders.filter(p => p.medicalCentreId === medicalCentreId);
    
    // Get all bookings for providers in this centre
    const allBookings = await db.getAllBookings();
    let centreBookings = allBookings.filter(b => 
      centreProviders.some(p => p.id === b.providerId)
    );
    
    // Apply filters
    if (status) {
      centreBookings = centreBookings.filter(b => b.status === status);
    }
    
    if (providerId) {
      centreBookings = centreBookings.filter(b => b.providerId === providerId);
    }
    
    if (startDate) {
      centreBookings = centreBookings.filter(b => {
        const bookingDate = b.scheduledDate || b.createdAt.toISOString().split('T')[0];
        return bookingDate >= startDate;
      });
    }
    
    if (endDate) {
      centreBookings = centreBookings.filter(b => {
        const bookingDate = b.scheduledDate || b.createdAt.toISOString().split('T')[0];
        return bookingDate <= endDate;
      });
    }
    
    // Sort by creation date (newest first)
    centreBookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Format response with provider info
    const formattedBookings = centreBookings.map(booking => {
      const provider = centreProviders.find(p => p.id === booking.providerId);
      return {
        id: booking.id,
        providerId: booking.providerId,
        providerName: provider?.name || 'Unknown',
        providerSpecialty: provider?.specialty || 'Unknown',
        serviceName: booking.service?.name || 'Unknown Service',
        servicePrice: booking.servicePrice,
        type: booking.type,
        status: booking.status,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        address: booking.address,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        completedAt: booking.completedAt,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: formattedBookings,
      total: formattedBookings.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching medical centre bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}


