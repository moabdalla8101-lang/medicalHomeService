import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db, prisma } from '@/lib/db';

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
    
    // Get all reviews with all statuses
    const allReviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
        booking: {
          select: {
            id: true,
            serviceId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Fetch service names for each review
    const reviewsWithServices = await Promise.all(
      allReviews.map(async (r: any) => {
        let serviceName = 'N/A';
        if (r.booking?.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: r.booking.serviceId },
            select: { name: true },
          });
          serviceName = service?.name || 'N/A';
        }
        
        return {
          id: r.id,
          bookingId: r.bookingId,
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          createdAt: r.createdAt,
          user: {
            id: r.user.id,
            name: r.user.name,
            phone: r.user.phone,
          },
          provider: {
            id: r.provider.id,
            name: r.provider.name,
            specialty: r.provider.specialty,
          },
          service: serviceName,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      reviews: reviewsWithServices,
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

