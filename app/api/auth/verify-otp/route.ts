import { NextRequest, NextResponse } from 'next/server';
import { verifyOTPAndAuthenticate, normalizePhone } from '@/lib/auth';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['user', 'provider']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[VERIFY-OTP] Received request body:', body);
    }
    
    // Validate the request
    let validatedData;
    try {
      validatedData = verifyOTPSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[VERIFY-OTP] Validation error:', error.errors);
        return NextResponse.json(
          { error: error.errors[0].message, details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
    
    const { phone, otp, role } = validatedData;
    
    const normalizedPhone = normalizePhone(phone);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[VERIFY-OTP] After normalization:', { originalPhone: phone, normalizedPhone, otp, role });
    }
    
    const result = await verifyOTPAndAuthenticate(normalizedPhone, otp, role);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        role: result.user.role,
        name: result.user.name,
      },
      token: result.token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
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
        { status: 400 }
      );
    }
    
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}

