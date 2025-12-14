import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateAvailabilitySchema = z.object({
  providerId: z.string(),
  availability: z.array(z.object({
    date: z.string(), // YYYY-MM-DD
    startTime: z.string(), // HH:mm
    endTime: z.string(), // HH:mm
    isAvailable: z.boolean().optional(),
  })),
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
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Get all providers for this medical centre
    const allProviders = await db.getAllProviders();
    let centreProviders = allProviders.filter(p => p.medicalCentreId === medicalCentreId);
    
    if (providerId) {
      centreProviders = centreProviders.filter(p => p.id === providerId);
    }
    
      // Get availability for each provider
      const availabilityData = [];
      for (const provider of centreProviders) {
        // Get all availability and filter by date range if provided
        const allAvailability = await db.getProviderAvailability(provider.id);
        let providerAvailability = allAvailability;
        
        if (startDate || endDate) {
          providerAvailability = allAvailability.filter(slot => {
            if (startDate && slot.date < startDate) return false;
            if (endDate && slot.date > endDate) return false;
            return true;
          });
        }
      
      availabilityData.push({
        providerId: provider.id,
        providerName: provider.name,
        availability: providerAvailability,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: availabilityData,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
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
        { error: 'Only medical centre admins can manage availability' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const data = updateAvailabilitySchema.parse(body);
    
    // Verify provider belongs to this medical centre
    const provider = await db.getProviderProfile(data.providerId);
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    if (provider.medicalCentreId !== user.medicalCentreId) {
      return NextResponse.json(
        { error: 'Provider does not belong to your medical centre' },
        { status: 403 }
      );
    }
    
    // Convert availability data to AvailabilitySlot format
    const availabilitySlots = data.availability.map(slot => ({
      id: '', // Will be generated
      providerId: data.providerId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable !== false,
      isBooked: false,
      bookingId: undefined,
    }));
    
    // Update provider availability
    const updated = await db.updateProviderProfile(data.providerId, {
      availability: availabilitySlots,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update availability' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: updated.availability,
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
    
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

