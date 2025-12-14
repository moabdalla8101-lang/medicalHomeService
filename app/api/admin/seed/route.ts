import { NextRequest, NextResponse } from 'next/server';
import { seedDummyProviders } from '@/lib/seedData';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const forceUpdate = body.forceUpdate === true || body.action === 'update-slots';
    
    // Check if providers already exist
    const existingProviders = await db.getAllProviders();
    
    if (existingProviders.length > 0 && !forceUpdate) {
      return NextResponse.json({
        success: true,
        message: 'Dummy data already exists. Send {"forceUpdate": true} to update availability slots.',
        providersCount: existingProviders.length,
      });
    }

    // Seed dummy providers (or update if forceUpdate is true)
    const count = await seedDummyProviders(forceUpdate);

    // Verify seeding
    const providers = await db.getAllProviders();
    
    return NextResponse.json({
      success: true,
      message: forceUpdate 
        ? `Updated ${count} providers with availability slots` 
        : 'Dummy data seeded successfully',
      providersCount: providers.length,
    });
  } catch (error) {
    console.error('Error seeding dummy data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed dummy data: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const providers = await db.getAllProviders();
    // For Prisma, we need to query users separately
    const { prisma } = await import('@/lib/db');
    const users = await prisma.user.findMany();
    
    return NextResponse.json({
      success: true,
      data: {
        providersCount: providers.length,
        usersCount: users.length,
        providers: providers.map(p => ({
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          status: p.status,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get data: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

