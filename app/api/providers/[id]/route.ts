import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = db.getProviderProfile(params.id);
    
    if (!provider || provider.status !== 'approved') {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // Get reviews
    const reviews = db.getProviderReviews(provider.id);
    
    // Get availability for next 7 days
    const today = new Date();
    const availability = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const slots = db.getProviderAvailability(provider.id, dateStr);
      availability.push({
        date: dateStr,
        slots: slots.filter(s => s.isAvailable && !s.isBooked),
      });
    }
    
    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        bio: provider.bio,
        experience: provider.experience,
        profilePhoto: provider.profilePhoto,
        gallery: provider.gallery || [],
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        emergencyAvailable: provider.emergencyAvailable,
        services: provider.services,
        availability,
        reviews: reviews.slice(0, 10), // Latest 10 reviews
      },
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

