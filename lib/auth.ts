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
// TEMPORARY: Hardcoded to '123456' for testing until WhatsApp API is ready
export function generateOTP(): string {
  // TODO: Remove hardcoded OTP when WhatsApp API is working
  // return Math.floor(100000 + Math.random() * 900000).toString();
  return '123456';
}

// Send OTP via Twilio WhatsApp or fallback to mock
export async function sendOTP(phone: string, code: string): Promise<boolean> {
  // Store OTP with expiry (10 minutes in dev, 5 minutes in production)
  const expirySeconds = process.env.NODE_ENV === 'development' ? 600 : 300;
  await db.setOTP(phone, code, expirySeconds);
  
  console.log(`[AUTH] OTP stored for ${phone}: ${code} (expires in ${expirySeconds}s)`);
  
  // Try Twilio WhatsApp if configured
  try {
    const { sendOTPViaWhatsApp, isWhatsAppConfigured } = await import('./whatsapp');
    
    if (isWhatsAppConfigured()) {
      try {
        console.log(`[AUTH] Sending OTP via Twilio WhatsApp to ${phone}`);
        const sent = await sendOTPViaWhatsApp(phone, code);
        if (sent) {
          console.log(`[AUTH] WhatsApp OTP sent successfully to ${phone}`);
          return true;
        } else {
          console.warn(`[AUTH] WhatsApp send failed, falling back to mock for ${phone}`);
        }
      } catch (error: any) {
        console.error(`[AUTH] WhatsApp send failed:`, error.message);
        // Fall through to mock/development mode
        if (process.env.NODE_ENV === 'production') {
          // In production, if WhatsApp fails, we should still log but not return false
          // The OTP is already stored, so user can still verify
          console.warn(`[AUTH] WhatsApp failed but OTP stored. User can still verify.`);
          return true; // Return true because OTP is stored
        }
      }
    } else {
      console.log(`[AUTH] Twilio WhatsApp not configured, using mock for ${phone}`);
    }
  } catch (error: any) {
    console.error(`[AUTH] Error importing WhatsApp module:`, error.message);
  }
  
  // Development/mock mode - log OTP to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MOCK] OTP ${code} for ${phone} (WhatsApp not configured or failed)`);
  }
  
  // Return true because OTP is stored regardless
  return true;
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
  let isValid = await db.verifyOTP(normalizedPhone, otp);
  
  // If not found, try without + prefix (in case of normalization mismatch)
  if (!isValid && normalizedPhone.startsWith('+')) {
    const phoneWithoutPlus = normalizedPhone.substring(1);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Trying without + prefix:', phoneWithoutPlus);
    }
    isValid = await db.verifyOTP(phoneWithoutPlus, otp);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH] OTP verification result:', isValid);
  }
  
  if (!isValid) {
    throw new Error('Invalid or expired OTP. Please request a new OTP.');
  }
  
  // Find or create user
  let user = await db.getUserByPhone(normalizedPhone);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH] User lookup:', { 
      found: !!user, 
      currentRole: user?.role, 
      requestedRole: role 
    });
  }
  
  if (!user) {
    // Create new user with the specified role (or default to 'user')
    const newRole = role || 'user';
    user = await db.createUser({
      phone: normalizedPhone,
      role: newRole,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Created new user with role:', newRole);
    }
  } else if (role) {
    // If role is provided (e.g., 'admin' when logging in via /admin), always update it
    // This ensures users logging in via /admin get admin role regardless of previous role
    if (user.role !== role) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] Updating user role from', user.role, 'to', role);
      }
      const updated = await db.updateUser(user.id, { role });
      if (updated) user = updated;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] User already has role:', role);
      }
    }
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
  const updated = await db.updateUser(user.id, {
    sessionToken: token,
    sessionExpiry,
  });
  if (updated) user = updated;
  
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
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = await db.getUserById(payload.userId);
  if (!user || user.sessionToken !== token) return null;
  
  // Check if session expired
  if (user.sessionExpiry && new Date() > user.sessionExpiry) {
    return null;
  }
  
  return user;
}

// Middleware helper for API routes
export async function requireAuth(authHeader: string | null): Promise<User> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const user = await getUserFromToken(token);
  
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

