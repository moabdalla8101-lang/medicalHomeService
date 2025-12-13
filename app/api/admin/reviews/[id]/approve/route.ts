import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can approve reviews' },
        { status: 403 }
      );
    }
    
    const allReviews = Array.from((db as any).reviews.values());
    const review = allReviews.find((r: any) => r.id === params.id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Update review status using db method
    const updated = db.updateReview(params.id, {
      status: 'approved',
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        status: 'approved',
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

