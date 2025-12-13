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
        { error: 'Only admins can reject reviews' },
        { status: 403 }
      );
    }
    
    // Update review status using db method
    const updated = db.updateReview(params.id, {
      status: 'rejected',
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Review not found or failed to update' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      review: {
        id: updated.id,
        status: updated.status,
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

