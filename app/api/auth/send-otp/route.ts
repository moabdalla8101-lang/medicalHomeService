import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, isValidKuwaitPhone, normalizePhone } from '@/lib/auth';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const sendOTPSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['user', 'provider']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role } = sendOTPSchema.parse(body);
    
    const normalizedPhone = normalizePhone(phone);
    
    if (!isValidKuwaitPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a valid Kuwait phone number (+965XXXXXXXX)' },
        { status: 400 }
      );
    }
    
    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOTP(normalizedPhone, otp);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('OTP sent:', {
        originalPhone: phone,
        normalizedPhone,
        otp,
      });
    }
    
    // In development, return OTP for testing (remove in production)
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      normalizedPhone, // Always return normalized phone so client can use it
      // Remove this in production:
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

