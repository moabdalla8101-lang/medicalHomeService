import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  platformCommissionPercent: z.number().min(0).max(100).optional(),
  emergencySurchargePercent: z.number().min(0).max(100).optional(),
  cancellationWindowHours: z.number().min(0).optional(),
  maxBookingsPerDayPerProvider: z.number().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    const config = await db.getSystemConfig();
    
    return NextResponse.json({
      success: true,
      config: {
        platformCommissionPercent: config.platformCommissionPercent,
        emergencySurchargePercent: config.emergencySurchargePercent,
        cancellationWindowHours: config.cancellationWindowHours,
        maxBookingsPerDayPerProvider: config.maxBookingsPerDayPerProvider,
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
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update settings' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updates = updateSettingsSchema.parse(body);
    
    const updated = await db.updateSystemConfig(updates, user.id);
    
    return NextResponse.json({
      success: true,
      config: {
        platformCommissionPercent: updated.platformCommissionPercent,
        emergencySurchargePercent: updated.emergencySurchargePercent,
        cancellationWindowHours: updated.cancellationWindowHours,
        maxBookingsPerDayPerProvider: updated.maxBookingsPerDayPerProvider,
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

