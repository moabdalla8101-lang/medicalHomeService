import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const createProviderSchema = z.object({
  userId: z.string().optional(), // If creating new user
  phone: z.string().optional(), // If creating new user
  name: z.string().min(1),
  bio: z.string().optional(),
  experience: z.number().optional(),
  specialty: z.string().min(1),
  profilePhoto: z.string().optional(),
  emergencyAvailable: z.boolean().optional(),
  maxBookingsPerDay: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const medicalCentreId = user.medicalCentreId;
    
    // Get all providers for this medical centre
    const allProviders = await db.getAllProviders();
    const centreProviders = allProviders.filter(p => p.medicalCentreId === medicalCentreId);
    
    return NextResponse.json({
      success: true,
      data: centreProviders.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        bio: p.bio,
        experience: p.experience,
        specialty: p.specialty,
        profilePhoto: p.profilePhoto,
        gallery: p.gallery,
        emergencyAvailable: p.emergencyAvailable,
        status: p.status,
        rating: p.rating,
        totalReviews: p.totalReviews,
        maxBookingsPerDay: p.maxBookingsPerDay,
        services: p.services,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching medical centre providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'medical_centre' || !user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Only medical centre admins can create providers' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const data = createProviderSchema.parse(body);
    const medicalCentreId = user.medicalCentreId;
    
    // If userId is provided, use existing user, otherwise create new user
    let providerUser;
    if (data.userId) {
      providerUser = await db.getUserById(data.userId);
      if (!providerUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    } else if (data.phone) {
      // Create new user with provider role
      const normalizedPhone = data.phone.startsWith('+') ? data.phone : `+965${data.phone}`;
      providerUser = await db.getUserByPhone(normalizedPhone);
      
      if (!providerUser) {
        providerUser = await db.createUser({
          phone: normalizedPhone,
          role: 'provider',
        });
      } else if (providerUser.role !== 'provider') {
        // Update role to provider
        const updated = await db.updateUser(providerUser.id, { role: 'provider' });
        if (updated) providerUser = updated;
      }
    } else {
      return NextResponse.json(
        { error: 'Either userId or phone must be provided' },
        { status: 400 }
      );
    }
    
    if (!providerUser) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }
    
    // Check if provider profile already exists
    const existingProfile = await db.getProviderProfileByUserId(providerUser.id);
    if (existingProfile) {
      // Update existing profile to assign to this medical centre
      const updated = await db.updateProviderProfile(existingProfile.id, {
        medicalCentreId: medicalCentreId,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Provider assigned to medical centre',
        data: updated,
      });
    }
    
    // Create new provider profile
    const profile = await db.createProviderProfile({
      userId: providerUser.id,
      name: data.name,
      bio: data.bio,
      experience: data.experience || 0,
      specialty: data.specialty,
      profilePhoto: data.profilePhoto,
      gallery: [],
      emergencyAvailable: data.emergencyAvailable || false,
      medicalCentreId: medicalCentreId,
      status: 'approved', // Medical centre admins can directly approve
      services: [],
      availability: [],
      maxBookingsPerDay: data.maxBookingsPerDay || 10,
    });
    
    return NextResponse.json({
      success: true,
      data: profile,
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
    
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { error: 'Failed to create provider' },
      { status: 500 }
    );
  }
}

