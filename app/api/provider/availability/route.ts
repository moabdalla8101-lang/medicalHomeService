import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AvailabilitySlot } from '@/lib/types';
import { z } from 'zod';

const createSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const updateSlotSchema = z.object({
  slotId: z.string(),
  isAvailable: z.boolean().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
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
    
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    const slots = db.getProviderAvailability(profile.id, date || undefined);
    
    return NextResponse.json({
      success: true,
      slots,
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can create slots' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { date, startTime, endTime } = createSlotSchema.parse(body);
    
    const profile = db.getProviderProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Check if slot already exists
    const existingSlots = db.getProviderAvailability(profile.id, date);
    const conflictingSlot = existingSlots.find(
      s => (s.startTime <= startTime && s.endTime > startTime) ||
           (s.startTime < endTime && s.endTime >= endTime) ||
           (s.startTime >= startTime && s.endTime <= endTime)
    );
    
    if (conflictingSlot) {
      return NextResponse.json(
        { error: 'Slot conflicts with existing availability' },
        { status: 400 }
      );
    }
    
    // Create new slot
    const slotId = `${profile.id}-${date}-${startTime.replace(':', '-')}`;
    const newSlot: AvailabilitySlot = {
      id: slotId,
      providerId: profile.id,
      date,
      startTime,
      endTime,
      isAvailable: true,
      isBooked: false,
    };
    
    const slots = profile.availability || [];
    slots.push(newSlot);
    db.updateProviderProfile(profile.id, {
      availability: slots,
    });
    
    return NextResponse.json({
      success: true,
      slot: newSlot,
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

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can update slots' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { slotId, ...updates } = updateSlotSchema.parse(body);
    
    const profile = db.getProviderProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const success = db.updateAvailabilitySlot(profile.id, slotId, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Slot updated successfully',
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

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can delete slots' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const slotId = searchParams.get('slotId');
    
    if (!slotId) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      );
    }
    
    const profile = db.getProviderProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const slots = profile.availability || [];
    const slotIndex = slots.findIndex(s => s.id === slotId);
    
    if (slotIndex === -1) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }
    
    // Don't allow deleting booked slots
    if (slots[slotIndex].isBooked) {
      return NextResponse.json(
        { error: 'Cannot delete a booked slot' },
        { status: 400 }
      );
    }
    
    slots.splice(slotIndex, 1);
    db.updateProviderProfile(profile.id, {
      availability: slots,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Slot deleted successfully',
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

