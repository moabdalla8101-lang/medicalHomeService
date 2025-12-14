import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    // Get all reviews - we'll need to add a method to get all reviews
    // For now, we'll get reviews from all providers
    const allProviders = await db.getAllProviders();
    const allReviews: any[] = [];
    for (const provider of allProviders) {
      const reviews = await db.getProviderReviews(provider.id);
      allReviews.push(...reviews);
    }
    const pendingReviews = allReviews.filter((r: any) => r.status === 'pending');
    
    return NextResponse.json({
      success: true,
      reviews: pendingReviews.map((r: any) => ({
        id: r.id,
        bookingId: r.bookingId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
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

