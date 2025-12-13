import { db } from './db';
import { User, UserRole } from './types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthTokenPayload {
  userId: string;
  phone: string;
  role: UserRole;
}

// Generate OTP (6 digits)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (mock implementation - replace with actual SMS service)
export async function sendOTP(phone: string, code: string): Promise<boolean> {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  console.log(`[MOCK] Sending OTP ${code} to ${phone}`);
  
  // Store OTP with longer expiry for development (10 minutes)
  const expirySeconds = process.env.NODE_ENV === 'development' ? 600 : 300;
  db.setOTP(phone, code, expirySeconds);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] OTP stored for ${phone}: ${code} (expires in ${expirySeconds}s)`);
  }
  
  // Simulate async SMS sending
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
}

// Verify phone number format (Kuwait: +965XXXXXXXX)
export function isValidKuwaitPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if starts with +965 or 965
  if (cleaned.startsWith('+965')) {
    // +965 followed by 8 digits
    return /^\+965\d{8}$/.test(cleaned);
  } else if (cleaned.startsWith('965')) {
    // 965 followed by 8 digits
    return /^965\d{8}$/.test(cleaned);
  } else if (cleaned.startsWith('0')) {
    // Local format: 0 followed by 8 digits
    return /^0\d{8}$/.test(cleaned);
  }
  
  return false;
}

// Normalize phone number to +965 format
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+965')) {
    return cleaned;
  } else if (cleaned.startsWith('965')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+965' + cleaned.substring(1);
  } else if (cleaned.length === 8) {
    return '+965' + cleaned;
  }
  
  return phone; // Return as-is if can't normalize
}

// Verify OTP and create/login user
export async function verifyOTPAndAuthenticate(
  phone: string,
  otp: string,
  role?: UserRole
): Promise<{ user: User; token: string } | null> {
  const normalizedPhone = normalizePhone(phone);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH] Verifying OTP:', {
      originalPhone: phone,
      normalizedPhone,
      otp,
    });
  }
  
  if (!isValidKuwaitPhone(normalizedPhone)) {
    throw new Error('Invalid Kuwait phone number format');
  }
  
  // Verify OTP - try with exact phone first, then try variations
  let isValid = db.verifyOTP(normalizedPhone, otp);
  
  // If not found, try without + prefix (in case of normalization mismatch)
  if (!isValid && normalizedPhone.startsWith('+')) {
    const phoneWithoutPlus = normalizedPhone.substring(1);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Trying without + prefix:', phoneWithoutPlus);
    }
    isValid = db.verifyOTP(phoneWithoutPlus, otp);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH] OTP verification result:', isValid);
  }
  
  if (!isValid) {
    throw new Error('Invalid or expired OTP. Please request a new OTP.');
  }
  
  // Find or create user
  let user = db.getUserByPhone(normalizedPhone);
  
  if (!user) {
    // Create new user
    user = db.createUser({
      phone: normalizedPhone,
      role: role || 'user',
    });
  } else if (role && user.role !== role) {
    // Update role if provided and different
    user = db.updateUser(user.id, { role })!;
  }
  
  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    } as AuthTokenPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Update user session
  const sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7 days
  user = db.updateUser(user.id, {
    sessionToken: token,
    sessionExpiry,
  })!;
  
  return { user, token };
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

// Get user from token
export function getUserFromToken(token: string): User | null {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = db.getUserById(payload.userId);
  if (!user || user.sessionToken !== token) return null;
  
  // Check if session expired
  if (user.sessionExpiry && new Date() > user.sessionExpiry) {
    return null;
  }
  
  return user;
}

// Middleware helper for API routes
export function requireAuth(authHeader: string | null): User {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const user = getUserFromToken(token);
  
  if (!user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
}

// Require specific role
export function requireRole(user: User, roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
}

