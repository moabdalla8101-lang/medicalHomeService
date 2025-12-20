import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const assignSchema = z.object({
  userId: z.string(),
  medicalCentreId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    // Only admins can assign medical centres
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can assign medical centres' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userId, medicalCentreId } = assignSchema.parse(body);
    
    // Verify medical centre exists
    const medicalCentre = await db.getMedicalCentre(medicalCentreId);
    if (!medicalCentre) {
      return NextResponse.json(
        { error: 'Medical centre not found' },
        { status: 404 }
      );
    }
    
    // Update user
    const updated = await db.updateUser(userId, {
      role: 'medical_centre',
      medicalCentreId: medicalCentreId,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Medical centre assigned successfully',
      user: {
        id: updated.id,
        phone: updated.phone,
        role: updated.role,
        medicalCentreId: updated.medicalCentreId,
        medicalCentre: updated.medicalCentre,
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
    
    console.error('Error assigning medical centre:', error);
    return NextResponse.json(
      { error: 'Failed to assign medical centre' },
      { status: 500 }
    );
  }
}



