import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  experience: z.number().optional(),
  specialty: z.string().optional(),
  emergencyAvailable: z.boolean().optional(),
  profilePhoto: z.string().optional(),
  availability: z.array(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can access this endpoint' },
        { status: 403 }
      );
    }
    
    const profile = db.getProviderProfileByUserId(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        bio: profile.bio,
        experience: profile.experience,
        specialty: profile.specialty,
        profilePhoto: profile.profilePhoto,
        gallery: profile.gallery,
        availability: profile.availability,
        emergencyAvailable: profile.emergencyAvailable,
        status: profile.status,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
        services: profile.services,
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

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can update their profile' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updates = updateProfileSchema.parse(body);
    
    let profile = db.getProviderProfileByUserId(user.id);
    
    // If profile doesn't exist, create it
    if (!profile) {
      // Require at least name and specialty for new profiles
      if (!updates.name || !updates.specialty) {
        return NextResponse.json(
          { error: 'Name and specialty are required to create a profile' },
          { status: 400 }
        );
      }
      
      profile = db.createProviderProfile({
        userId: user.id,
        name: updates.name,
        bio: updates.bio || '',
        experience: updates.experience || 0,
        specialty: updates.specialty,
        profilePhoto: updates.profilePhoto,
        gallery: [],
        emergencyAvailable: updates.emergencyAvailable || false,
        status: 'pending', // New profiles need admin approval
        services: [],
        availability: updates.availability || [],
        maxBookingsPerDay: 10, // Default value for new profiles
      });
    } else {
      // Update existing profile
      const updated = db.updateProviderProfile(profile.id, updates);
      
      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
      
      profile = updated;
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        bio: profile.bio,
        experience: profile.experience,
        specialty: profile.specialty,
        emergencyAvailable: profile.emergencyAvailable,
        profilePhoto: profile.profilePhoto,
        status: profile.status,
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

