// Simple in-memory database for development
// In production, replace with PostgreSQL/MongoDB/etc.

import { User, ProviderProfile, Booking, Review, Payment, SystemConfig, Notification, Service, AvailabilitySlot } from './types';

// Helper to generate UUID (simple implementation)
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// In-memory storage - use global to persist across hot reloads in development
declare global {
  var __db_users: Map<string, User> | undefined;
  var __db_providerProfiles: Map<string, ProviderProfile> | undefined;
  var __db_bookings: Map<string, Booking> | undefined;
  var __db_reviews: Map<string, Review> | undefined;
  var __db_payments: Map<string, Payment> | undefined;
  var __db_notifications: Map<string, Notification> | undefined;
  var __db_systemConfig: SystemConfig | undefined;
  var __db_otpStore: Map<string, { code: string; expiresAt: Date }> | undefined;
  var __db_seeded: boolean | undefined;
}

// In-memory storage - persist across hot reloads
let users: Map<string, User> = global.__db_users || new Map();
let providerProfiles: Map<string, ProviderProfile> = global.__db_providerProfiles || new Map();
let bookings: Map<string, Booking> = global.__db_bookings || new Map();
let reviews: Map<string, Review> = global.__db_reviews || new Map();
let payments: Map<string, Payment> = global.__db_payments || new Map();
let notifications: Map<string, Notification> = global.__db_notifications || new Map();
let systemConfig: SystemConfig | null = global.__db_systemConfig || null;

// OTP storage (phone -> { code, expiresAt }) - persist across hot reloads
let otpStore: Map<string, { code: string; expiresAt: Date }> = global.__db_otpStore || new Map();

// Store references in global to persist across hot reloads
if (process.env.NODE_ENV === 'development') {
  global.__db_users = users;
  global.__db_providerProfiles = providerProfiles;
  global.__db_bookings = bookings;
  global.__db_reviews = reviews;
  global.__db_payments = payments;
  global.__db_notifications = notifications;
  if (systemConfig) global.__db_systemConfig = systemConfig;
  global.__db_otpStore = otpStore;
  
  // Log when store is initialized/reused
  if (global.__db_otpStore.size > 0) {
    console.log('[DB] Reusing existing OTP store with', global.__db_otpStore.size, 'entries');
  }
}

// Initialize default system config
if (!systemConfig) {
  systemConfig = {
    id: uuidv4(),
    platformCommissionPercent: 15,
    emergencySurchargePercent: 25,
    cancellationWindowHours: 24,
    maxBookingsPerDayPerProvider: 10,
    updatedAt: new Date(),
    updatedBy: 'system',
  };
  if (process.env.NODE_ENV === 'development') {
    global.__db_systemConfig = systemConfig;
  }
}

// Seed dummy data in development - defer to avoid circular dependency
// In production, use /api/admin/seed endpoint to populate data
if (process.env.NODE_ENV === 'development') {
  // Only seed once per server instance
  if (!global.__db_seeded) {
    // Use setTimeout to defer seeding until after module initialization
    setTimeout(() => {
      try {
        const { seedDummyProviders } = require('./seedData');
        seedDummyProviders();
      } catch (error) {
        console.error('[DB] Error seeding dummy data:', error);
      }
    }, 100);
    global.__db_seeded = true;
  }
}

// User operations
export const db = {
  // Users
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const newUser: User = {
      ...user,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(newUser.id, newUser);
    return newUser;
  },

  getUserById: (id: string): User | undefined => {
    return users.get(id);
  },

  getUserByPhone: (phone: string): User | undefined => {
    return Array.from(users.values()).find(u => u.phone === phone);
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  },

  // Provider Profiles
  createProviderProfile: (profile: Omit<ProviderProfile, 'id' | 'rating' | 'totalReviews'>): ProviderProfile => {
    const newProfile: ProviderProfile = {
      ...profile,
      id: uuidv4(),
      rating: 0,
      totalReviews: 0,
    };
    providerProfiles.set(newProfile.id, newProfile);
    return newProfile;
  },

  getProviderProfile: (id: string): ProviderProfile | undefined => {
    return providerProfiles.get(id);
  },

  getProviderProfileByUserId: (userId: string): ProviderProfile | undefined => {
    return Array.from(providerProfiles.values()).find(p => p.userId === userId);
  },

  getAllProviders: (filters?: {
    status?: ProviderProfile['status'];
    emergencyAvailable?: boolean;
    specialty?: string;
  }): ProviderProfile[] => {
    let providers = Array.from(providerProfiles.values());
    
    if (filters?.status) {
      providers = providers.filter(p => p.status === filters.status);
    }
    if (filters?.emergencyAvailable !== undefined) {
      providers = providers.filter(p => p.emergencyAvailable === filters.emergencyAvailable);
    }
    if (filters?.specialty) {
      providers = providers.filter(p => p.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()));
    }
    
    return providers;
  },

  updateProviderProfile: (id: string, updates: Partial<ProviderProfile>): ProviderProfile | null => {
    const profile = providerProfiles.get(id);
    if (!profile) return null;
    const updated = { ...profile, ...updates };
    providerProfiles.set(id, updated);
    return updated;
  },

  // Bookings
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
    const newBooking: Booking = {
      ...booking,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    bookings.set(newBooking.id, newBooking);
    return newBooking;
  },

  getBooking: (id: string): Booking | undefined => {
    return bookings.get(id);
  },

  getUserBookings: (userId: string): Booking[] => {
    return Array.from(bookings.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getProviderBookings: (providerId: string): Booking[] => {
    return Array.from(bookings.values())
      .filter(b => b.providerId === providerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  updateBooking: (id: string, updates: Partial<Booking>): Booking | null => {
    const booking = bookings.get(id);
    if (!booking) return null;
    const updated = { ...booking, ...updates, updatedAt: new Date() };
    bookings.set(id, updated);
    return updated;
  },

  // Reviews
  createReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review => {
    const newReview: Review = {
      ...review,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    reviews.set(newReview.id, newReview);
    
    // Update provider rating if approved
    if (newReview.status === 'approved') {
      const provider = providerProfiles.get(newReview.providerId);
      if (provider) {
        const allReviews = Array.from(reviews.values()).filter(r => r.providerId === provider.id && r.status === 'approved');
        const avgRating = allReviews.length > 0 
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
          : 0;
        providerProfiles.set(provider.id, {
          ...provider,
          rating: avgRating,
          totalReviews: allReviews.length,
        });
      }
    }
    
    return newReview;
  },

  updateReview: (id: string, updates: Partial<Review>): Review | null => {
    const review = reviews.get(id);
    if (!review) return null;
    const updated = { ...review, ...updates, updatedAt: new Date() };
    reviews.set(id, updated);
    
    // Update provider rating if status changed to approved
    if (updates.status === 'approved') {
      const provider = providerProfiles.get(updated.providerId);
      if (provider) {
        const allReviews = Array.from(reviews.values()).filter(r => r.providerId === provider.id && r.status === 'approved');
        const avgRating = allReviews.length > 0 
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
          : 0;
        providerProfiles.set(provider.id, {
          ...provider,
          rating: avgRating,
          totalReviews: allReviews.length,
        });
      }
    }
    
    return updated;
  },

  getProviderReviews: (providerId: string): Review[] => {
    return Array.from(reviews.values())
      .filter(r => r.providerId === providerId && r.status === 'approved')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Payments
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment => {
    const newPayment: Payment = {
      ...payment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payments.set(newPayment.id, newPayment);
    return newPayment;
  },

  getPayment: (id: string): Payment | undefined => {
    return payments.get(id);
  },

  // System Config
  getSystemConfig: (): SystemConfig => {
    return systemConfig!;
  },

  updateSystemConfig: (updates: Partial<SystemConfig>, updatedBy: string): SystemConfig => {
    systemConfig = {
      ...systemConfig!,
      ...updates,
      updatedAt: new Date(),
      updatedBy,
    };
    return systemConfig;
  },

  // Notifications
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date(),
    };
    notifications.set(newNotification.id, newNotification);
    return newNotification;
  },

  getUserNotifications: (userId: string, unreadOnly = false): Notification[] => {
    let userNotifications = Array.from(notifications.values())
      .filter(n => n.userId === userId);
    
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }
    
    return userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  markNotificationRead: (id: string): boolean => {
    const notification = notifications.get(id);
    if (!notification) return false;
    notifications.set(id, { ...notification, read: true });
    return true;
  },

  // OTP
  setOTP: (phone: string, code: string, expiresInSeconds = 300): void => {
    otpStore.set(phone, {
      code,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] OTP stored for ${phone}: ${code} (expires in ${expiresInSeconds}s)`);
      console.log(`[DB] Current OTP store keys:`, Array.from(otpStore.keys()));
    }
  },

  verifyOTP: (phone: string, code: string): boolean => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Verifying OTP for ${phone}: ${code}`);
      console.log(`[DB] Current OTP store keys:`, Array.from(otpStore.keys()));
    }
    
    const otpData = otpStore.get(phone);
    if (!otpData) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB] OTP not found for phone: ${phone}`);
        console.log(`[DB] Available phones in store:`, Array.from(otpStore.keys()));
      }
      return false;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Found OTP data:`, { 
        storedCode: otpData.code, 
        receivedCode: code,
        expiresAt: otpData.expiresAt,
        now: new Date(),
        isExpired: new Date() > otpData.expiresAt
      });
    }
    
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(phone);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB] OTP expired for phone: ${phone}`);
      }
      return false;
    }
    if (otpData.code !== code) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB] OTP mismatch: expected "${otpData.code}", received "${code}"`);
      }
      return false;
    }
    otpStore.delete(phone);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] OTP verified successfully for ${phone}`);
    }
    return true;
  },

  // Availability Slots
  getProviderAvailability: (providerId: string, date?: string): AvailabilitySlot[] => {
    const profile = Array.from(providerProfiles.values()).find(p => p.id === providerId);
    if (!profile) return [];
    
    let slots = profile.availability || [];
    if (date) {
      slots = slots.filter(s => s.date === date);
    }
    return slots;
  },

  updateAvailabilitySlot: (providerId: string, slotId: string, updates: Partial<AvailabilitySlot>): boolean => {
    const profile = providerProfiles.get(providerId);
    if (!profile) return false;
    
    const slots = profile.availability || [];
    const slotIndex = slots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) return false;
    
    slots[slotIndex] = { ...slots[slotIndex], ...updates };
    providerProfiles.set(providerId, { ...profile, availability: slots });
    return true;
  },
};

