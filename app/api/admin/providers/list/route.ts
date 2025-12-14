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
    
    const providers = await db.getAllProviders();
    
    // Get phone numbers for each provider
    const providersWithPhones = await Promise.all(providers.map(async (provider) => {
      const providerUser = await db.getUserById(provider.userId);
      return {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        phone: providerUser?.phone || 'N/A',
        status: provider.status,
        emergencyAvailable: provider.emergencyAvailable,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
      };
    }));
    
    return NextResponse.json({
      success: true,
      providers: providersWithPhones,
      count: providersWithPhones.length,
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

