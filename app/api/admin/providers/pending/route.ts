import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const providers = db.getAllProviders({ status: 'pending' });
    
    return NextResponse.json({
      success: true,
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        bio: p.bio,
        experience: p.experience,
        civilId: p.civilId,
        medicalLicense: p.medicalLicense,
        iban: p.iban,
      })),
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

