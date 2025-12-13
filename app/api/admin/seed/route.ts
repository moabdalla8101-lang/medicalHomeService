import { NextRequest, NextResponse } from 'next/server';
import { seedDummyProviders } from '@/lib/seedData';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if providers already exist
    const existingProviders = db.getAllProviders();
    
    if (existingProviders.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Dummy data already exists',
        providersCount: existingProviders.length,
      });
    }

    // Seed dummy providers
    seedDummyProviders();

    // Verify seeding
    const providers = db.getAllProviders();
    
    return NextResponse.json({
      success: true,
      message: 'Dummy data seeded successfully',
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
    const providers = db.getAllProviders();
    const users = Array.from((db as any).users?.values() || []);
    
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

