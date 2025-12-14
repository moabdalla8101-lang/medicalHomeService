import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ProviderFilters } from '@/lib/types';

// Force dynamic rendering since we use searchParams
// These configs prevent Next.js from trying to statically generate this route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    // Access searchParams - route is marked as dynamic so this only runs at request time
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const serviceType = searchParams.get('serviceType') as any;
    const gender = searchParams.get('gender') as 'male' | 'female' | null;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const availableNow = searchParams.get('availableNow') === 'true';
    const emergencyAvailable = searchParams.get('emergencyAvailable') === 'true';
    const searchQuery = searchParams.get('search') || undefined;
    
    // Get all approved providers
    let providers = await db.getAllProviders({ status: 'approved' });
    
    // Apply filters
    if (serviceType) {
      providers = providers.filter(p => 
        p.services.some(s => s.category === serviceType)
      );
    }
    
    if (gender) {
      // Note: Gender filter would need to be added to ProviderProfile type
      // For now, we'll skip this filter
    }
    
    if (minRating !== undefined) {
      providers = providers.filter(p => p.rating >= minRating);
    }
    
    if (maxPrice !== undefined) {
      providers = providers.filter(p => 
        p.services.some(s => s.price <= maxPrice)
      );
    }
    
    if (emergencyAvailable) {
      providers = providers.filter(p => p.emergencyAvailable);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      providers = providers.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.specialty.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query)
      );
    }
    
    // Sort by rating (highest first)
    providers.sort((a, b) => b.rating - a.rating);
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProviders = providers.slice(start, end);
    
    // Format response
    const formattedProviders = paginatedProviders.map(provider => ({
      id: provider.id,
      name: provider.name,
      specialty: provider.specialty,
      bio: provider.bio,
      experience: provider.experience,
      profilePhoto: provider.profilePhoto,
      rating: provider.rating,
      totalReviews: provider.totalReviews,
      emergencyAvailable: provider.emergencyAvailable,
      services: provider.services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        category: s.category,
      })),
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedProviders,
      page,
      limit,
      total: providers.length,
      hasMore: end < providers.length,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

