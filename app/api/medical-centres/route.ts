import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const createCentreSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  license: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'inactive' | 'suspended' | null;
    
    const centres = await db.getAllMedicalCentres(
      status ? { status } : undefined
    );
    
    return NextResponse.json({
      success: true,
      data: centres,
    });
  } catch (error) {
    console.error('Error fetching medical centres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical centres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCentreSchema.parse(body);
    
    const centre = await db.createMedicalCentre({
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || undefined,
      license: data.license,
      status: data.status || 'active',
    });
    
    return NextResponse.json({
      success: true,
      data: centre,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Error creating medical centre:', error);
    return NextResponse.json(
      { error: 'Failed to create medical centre' },
      { status: 500 }
    );
  }
}


