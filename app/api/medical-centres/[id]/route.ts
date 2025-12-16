import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateCentreSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  license: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const centre = await db.getMedicalCentre(params.id);
    
    if (!centre) {
      return NextResponse.json(
        { error: 'Medical centre not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: centre,
    });
  } catch (error) {
    console.error('Error fetching medical centre:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical centre' },
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
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update medical centres' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updates = updateCentreSchema.parse(body);
    
    const updated = await db.updateMedicalCentre(params.id, updates);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Medical centre not found' },
        { status: 404 }
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
    
    console.error('Error updating medical centre:', error);
    return NextResponse.json(
      { error: 'Failed to update medical centre' },
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
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete medical centres' },
        { status: 403 }
      );
    }
    
    const success = await db.deleteMedicalCentre(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Medical centre not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Medical centre deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error deleting medical centre:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical centre' },
      { status: 500 }
    );
  }
}


