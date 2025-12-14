import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { initiateKNETPayment } from '@/lib/paymentService';
import { z } from 'zod';

// Force dynamic rendering since we use nextUrl
export const dynamic = 'force-dynamic';

const initiatePaymentSchema = z.object({
  bookingId: z.string(),
  returnUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAuth(authHeader);
    
    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can initiate payments' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { bookingId, returnUrl } = initiatePaymentSchema.parse(body);
    
    const result = await initiateKNETPayment(
      bookingId,
      returnUrl || `${request.nextUrl.origin}/bookings`
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate payment' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      redirectUrl: result.redirectUrl,
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
    
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

