import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can approve providers' },
        { status: 403 }
      );
    }
    
    const profile = db.getProviderProfile(params.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    const updated = db.updateProviderProfile(params.id, {
      status: 'approved',
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to approve provider' },
        { status: 500 }
      );
    }
    
    // Notify provider
    const providerUser = db.getUserById(updated.userId);
    if (providerUser) {
      db.createNotification({
        userId: providerUser.id,
        type: 'provider_approved',
        title: 'Profile Approved',
        message: 'Your provider profile has been approved. You can now start accepting bookings.',
        data: { providerId: updated.id },
        read: false,
      });
    }
    
    return NextResponse.json({
      success: true,
      provider: {
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

