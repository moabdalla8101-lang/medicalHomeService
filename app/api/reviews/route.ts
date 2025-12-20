import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'المستخدمون فقط يمكنهم إنشاء التقييمات' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { bookingId, rating, comment } = createReviewSchema.parse(body);
    
    // Verify booking belongs to user and is completed
    const booking = await db.getBooking(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'يمكن تقييم الحجوزات المكتملة فقط' },
        { status: 400 }
      );
    }
    
    // Check if review already exists (including pending reviews)
    const existingReview = await db.getReviewByBookingId(bookingId);
    if (existingReview) {
      return NextResponse.json(
        { error: 'تم إرسال تقييم لهذه الحجز مسبقاً' },
        { status: 400 }
      );
    }
    
    // Create review (pending moderation)
    const review = await db.createReview({
      bookingId,
      userId: user.id,
      providerId: booking.providerId,
      rating,
      comment: comment || undefined,
      status: 'pending', // Requires admin approval
    });
    
    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
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
    
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    
    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }
    
    const reviews = await db.getProviderReviews(providerId);
    
    return NextResponse.json({
      success: true,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

