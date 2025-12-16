import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  experience: z.number().optional(),
  specialty: z.string().optional(),
  profilePhoto: z.string().optional(),
  emergencyAvailable: z.boolean().optional(),
  maxBookingsPerDay: z.number().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const provider = await db.getProviderProfile(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    if (provider.medicalCentreId !== user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Provider does not belong to your medical centre' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can update providers' },
        { status: 403 }
      );
    }
    
    const provider = await db.getProviderProfile(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    if (provider.medicalCentreId !== user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Provider does not belong to your medical centre' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updates = updateProviderSchema.parse(body);
    
    const updated = await db.updateProviderProfile(params.id, updates);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update provider' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updated,
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
    
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can remove providers' },
        { status: 403 }
      );
    }
    
    const provider = await db.getProviderProfile(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    if (provider.medicalCentreId !== user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Provider does not belong to your medical centre' },
        { status: 403 }
      );
    }
    
    // Remove provider from medical centre (set medicalCentreId to null)
    const updated = await db.updateProviderProfile(params.id, {
      medicalCentreId: undefined,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to remove provider' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Provider removed from medical centre',
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error removing provider:', error);
    return NextResponse.json(
      { error: 'Failed to remove provider' },
      { status: 500 }
    );
  }
}


