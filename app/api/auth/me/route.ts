import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    // Get provider profile if user is a provider
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = db.getProviderProfileByUserId(user.id);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        address: user.address,
        providerProfile: providerProfile ? {
          id: providerProfile.id,
          name: providerProfile.name,
          specialty: providerProfile.specialty,
          status: providerProfile.status,
          rating: providerProfile.rating,
          totalReviews: providerProfile.totalReviews,
        } : null,
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

