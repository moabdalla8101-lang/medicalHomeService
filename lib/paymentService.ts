import { db } from './db';
import { Payment, Booking } from './types';

// Mock KNET payment integration
// In production, integrate with actual KNET API

export interface KNETPaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  returnUrl: string;
}

export interface KNETPaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

export async function initiateKNETPayment(
  bookingId: string,
  returnUrl: string
): Promise<KNETPaymentResponse> {
  const booking = await db.getBooking(bookingId);
  
  if (!booking) {
    return {
      success: false,
      paymentId: '',
      error: 'Booking not found',
    };
  }
  
  if (booking.paymentStatus === 'paid') {
    return {
      success: false,
      paymentId: '',
      error: 'Booking already paid',
    };
  }
  
  // Create payment record
  const payment = await db.createPayment({
    bookingId: booking.id,
    userId: booking.userId,
    amount: booking.totalPrice,
    currency: 'KWD',
    status: 'pending',
    paymentMethod: 'knet',
  });
  
  // In production, call KNET API here
  // For now, simulate payment processing
  const transactionId = `KNET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock: Auto-approve payment after 2 seconds (for demo)
  setTimeout(() => {
    processPayment(payment.id, transactionId, true);
  }, 2000);
  
  return {
    success: true,
    paymentId: payment.id,
    transactionId,
    // In production, this would be the KNET payment page URL
    redirectUrl: `/payment/process?paymentId=${payment.id}&transactionId=${transactionId}`,
  };
}

export async function processPayment(
  paymentId: string,
  transactionId: string,
  success: boolean
): Promise<boolean> {
  const payment = await db.getPayment(paymentId);
  if (!payment) return false;
  
  const booking = await db.getBooking(payment.bookingId);
  if (!booking) return false;
  
  if (success) {
    // Update payment status
    await db.updatePayment(paymentId, {
      status: 'completed',
      knetTransactionId: transactionId,
    });
    
    // Update booking payment status
    await db.updateBooking(booking.id, {
      paymentStatus: 'paid',
      paymentId: payment.id,
    });
    
    // Create notification
    await db.createNotification({
      userId: booking.userId,
      type: 'booking_confirmed',
      title: 'Payment Successful',
      message: `Your payment of ${booking.totalPrice} KWD has been processed successfully.`,
      data: { bookingId: booking.id, paymentId: payment.id },
      read: false,
    });
    
    return true;
  } else {
    // Update payment status to failed
    await db.updatePayment(paymentId, {
      status: 'failed',
    });
    
    return false;
  }
}

export async function refundPayment(paymentId: string, reason?: string): Promise<boolean> {
  const payment = await db.getPayment(paymentId);
  if (!payment || payment.status !== 'completed') {
    return false;
  }
  
  const booking = await db.getBooking(payment.bookingId);
  if (!booking) return false;
  
  // In production, call KNET refund API
  // For now, just update status
  await db.updatePayment(paymentId, {
    status: 'refunded',
  });
  
  await db.updateBooking(booking.id, {
    paymentStatus: 'refunded',
  });
  
  // Create notification
  await db.createNotification({
    userId: booking.userId,
    type: 'booking_cancelled',
    title: 'Payment Refunded',
    message: `Your payment of ${payment.amount} KWD has been refunded.${reason ? ` Reason: ${reason}` : ''}`,
    data: { bookingId: booking.id, paymentId: payment.id },
    read: false,
  });
  
  return true;
}

