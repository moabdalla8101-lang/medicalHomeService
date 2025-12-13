import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can reject providers' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { reason } = rejectSchema.parse(body);
    
    const profile = db.getProviderProfile(params.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    const updated = db.updateProviderProfile(params.id, {
      status: 'rejected',
      rejectionReason: reason,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to reject provider' },
        { status: 500 }
      );
    }
    
    // Notify provider
    const providerUser = db.getUserById(updated.userId);
    if (providerUser) {
      db.createNotification({
        userId: providerUser.id,
        type: 'provider_rejected',
        title: 'Profile Rejected',
        message: `Your provider profile has been rejected. Reason: ${reason}`,
        data: { providerId: updated.id, reason },
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

