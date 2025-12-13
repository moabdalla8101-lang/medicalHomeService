import { NextRequest, NextResponse } from 'next/server';
import { processPayment } from '@/lib/paymentService';

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const transactionId = searchParams.get('transactionId');
    
    if (!paymentId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing payment or transaction ID' },
        { status: 400 }
      );
    }
    
    // Process payment (in production, this would verify with KNET)
    const success = await processPayment(paymentId, transactionId, true);
    
    if (success) {
      return NextResponse.redirect(new URL('/bookings?payment=success', request.url));
    } else {
      return NextResponse.redirect(new URL('/bookings?payment=failed', request.url));
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
  }
}

