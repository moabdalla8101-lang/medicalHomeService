import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createBooking } from '@/lib/bookingService';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const createBookingSchema = z.object({
  providerId: z.string(),
  serviceId: z.string(),
  type: z.enum(['standard', 'emergency']),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  slotId: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can create bookings' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const validated = createBookingSchema.parse(body);
    
    // Validate standard booking requirements
    if (validated.type === 'standard') {
      if (!validated.scheduledDate || !validated.scheduledTime || !validated.slotId) {
        return NextResponse.json(
          { error: 'Date, time, and slot are required for standard bookings' },
          { status: 400 }
        );
      }
    }
    
    const booking = await createBooking({
      userId: user.id,
      ...validated,
    });
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        type: booking.type,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
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
        { status: 400 }
      );
    }
    
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    const { db } = await import('@/lib/db');
    
    let bookings: any[] = [];
    if (user.role === 'user') {
      bookings = await db.getUserBookings(user.id);
    } else if (user.role === 'provider') {
      // For providers, we need to get their profile first
      const profile = await db.getProviderProfileByUserId(user.id);
      if (!profile) {
        return NextResponse.json({
          success: true,
          bookings: [],
        });
      }
      bookings = await db.getProviderBookings(profile.id);
    } else {
      // Admin - return all bookings (or empty for now)
      bookings = [];
    }
    
    // For users, check if each booking has a review
    const bookingsWithReviewStatus = await Promise.all(
      bookings.map(async (b) => {
        let hasReview = false;
        if (user.role === 'user') {
          const review = await db.getReviewByBookingId(b.id);
          hasReview = !!review;
        }
        return {
          id: b.id,
          status: b.status,
          type: b.type,
          service: b.service.name,
          serviceId: b.serviceId,
          providerId: b.providerId,
          totalPrice: b.totalPrice,
          scheduledDate: b.scheduledDate,
          scheduledTime: b.scheduledTime,
          address: b.address,
          createdAt: b.createdAt,
          hasReview,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      bookings: bookingsWithReviewStatus,
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

