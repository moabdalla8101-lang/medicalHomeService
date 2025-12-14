import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateBookingStatus } from '@/lib/bookingService';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled']),
  cancellationReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    const body = await request.json();
    const { status, cancellationReason } = updateStatusSchema.parse(body);
    
    // Check if user has permission to update this booking
    const { db } = await import('@/lib/db');
    const booking = await db.getBooking(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Only provider or admin can update booking status
    if (user.role === 'user' && booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    if (user.role === 'provider') {
      const profile = await db.getProviderProfileByUserId(user.id);
      if (!profile || booking.providerId !== profile.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
    
    const updated = await updateBookingStatus(
      params.id,
      status,
      user.role === 'admin' ? 'admin' : user.role === 'provider' ? 'provider' : 'user',
      cancellationReason
    );
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking: {
        id: updated.id,
        status: updated.status,
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
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

