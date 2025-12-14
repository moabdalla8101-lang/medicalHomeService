// PostgreSQL database using Prisma
// Replace in-memory database with Prisma ORM
// Note: Run 'npx prisma generate' after installing dependencies to generate PrismaClient

// @ts-ignore - PrismaClient will be available after running 'npx prisma generate'
import { PrismaClient } from '@prisma/client';
import { User, ProviderProfile, Booking, Review, Payment, SystemConfig, Notification, Service, AvailabilitySlot } from './types';

// Prisma Client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper functions to convert Prisma models to TypeScript types
function prismaUserToUser(user: any): User {
  return {
    id: user.id,
    phone: user.phone,
    role: user.role as any,
    name: user.name || undefined,
    address: user.address || undefined,
    sessionToken: user.sessionToken || undefined,
    sessionExpiry: user.sessionExpiry || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function prismaProviderToProvider(provider: any): ProviderProfile {
  return {
    id: provider.id,
    userId: provider.userId,
    name: provider.name,
    bio: provider.bio || undefined,
    experience: provider.experience || undefined,
    specialty: provider.specialty,
    profilePhoto: provider.profilePhoto || undefined,
    gallery: provider.gallery || [],
    civilId: provider.civilId || undefined,
    medicalLicense: provider.medicalLicense || undefined,
    iban: provider.iban || undefined,
    status: provider.status as any,
    rejectionReason: provider.rejectionReason || undefined,
    emergencyAvailable: provider.emergencyAvailable,
    rating: provider.rating,
    totalReviews: provider.totalReviews,
    maxBookingsPerDay: provider.maxBookingsPerDay,
    services: (provider.services || []).map((s: any) => ({
      id: s.id,
      providerId: s.providerId,
      name: s.name,
      description: s.description || undefined,
      price: s.price,
      duration: s.duration,
      category: s.category as any,
    })),
    availability: (provider.availability || []).map((a: any) => ({
      id: a.id,
      providerId: a.providerId,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      isAvailable: a.isAvailable,
      isBooked: a.isBooked,
      bookingId: a.bookingId || undefined,
    })),
  };
}

function prismaBookingToBooking(booking: any): Booking {
  return {
    id: booking.id,
    userId: booking.userId,
    providerId: booking.providerId,
    serviceId: booking.serviceId,
    service: booking.service ? {
      id: booking.service.id,
      providerId: booking.service.providerId,
      name: booking.service.name,
      description: booking.service.description || undefined,
      price: booking.service.price,
      duration: booking.service.duration,
      category: booking.service.category as any,
    } : {} as Service,
    type: booking.type as any,
    scheduledDate: booking.scheduledDate || undefined,
    scheduledTime: booking.scheduledTime || undefined,
    slotId: booking.slotId || undefined,
    address: booking.address,
    latitude: booking.latitude || undefined,
    longitude: booking.longitude || undefined,
    notes: booking.notes || undefined,
    status: booking.status as any,
    servicePrice: booking.servicePrice,
    emergencySurcharge: booking.emergencySurcharge || undefined,
    platformCommission: booking.platformCommission,
    totalPrice: booking.totalPrice,
    providerEarnings: booking.providerEarnings,
    paymentStatus: booking.paymentStatus as any,
    paymentId: booking.paymentId || undefined,
    paymentMethod: booking.paymentMethod || undefined,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    completedAt: booking.completedAt || undefined,
    cancelledAt: booking.cancelledAt || undefined,
    cancellationReason: booking.cancellationReason || undefined,
    eta: booking.eta || undefined,
    assignedAt: booking.assignedAt || undefined,
  };
}

function prismaReviewToReview(review: any): Review {
  return {
    id: review.id,
    bookingId: review.bookingId,
    userId: review.userId,
    providerId: review.providerId,
    rating: review.rating,
    comment: review.comment || undefined,
    status: review.status as any,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function prismaPaymentToPayment(payment: any): Payment {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status as any,
    paymentMethod: payment.paymentMethod as any,
    knetTransactionId: payment.knetTransactionId || undefined,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function prismaNotificationToNotification(notification: any): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as any,
    title: notification.title,
    message: notification.message,
    data: notification.data || undefined,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

// Initialize default system config if it doesn't exist
async function ensureSystemConfig(): Promise<SystemConfig> {
  let config = await prisma.systemConfig.findFirst();
  
  if (!config) {
    config = await prisma.systemConfig.create({
      data: {
        platformCommissionPercent: 15,
        emergencySurchargePercent: 25,
        cancellationWindowHours: 24,
        maxBookingsPerDayPerProvider: 10,
        updatedBy: 'system',
      },
    });
  }
  
  return {
    id: config.id,
    platformCommissionPercent: config.platformCommissionPercent,
    emergencySurchargePercent: config.emergencySurchargePercent,
    cancellationWindowHours: config.cancellationWindowHours,
    maxBookingsPerDayPerProvider: config.maxBookingsPerDayPerProvider,
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy,
  };
}

// Database operations
export const db = {
  // Users
  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const created = await prisma.user.create({
      data: {
        phone: user.phone,
        role: user.role,
        name: user.name,
        address: user.address,
        sessionToken: user.sessionToken,
        sessionExpiry: user.sessionExpiry,
      },
    });
    return prismaUserToUser(created);
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? prismaUserToUser(user) : undefined;
  },

  getUserByPhone: async (phone: string): Promise<User | undefined> => {
    const user = await prisma.user.findUnique({ where: { phone } });
    return user ? prismaUserToUser(user) : undefined;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          phone: updates.phone,
          role: updates.role,
          name: updates.name,
          address: updates.address,
          sessionToken: updates.sessionToken,
          sessionExpiry: updates.sessionExpiry,
        },
      });
      return prismaUserToUser(updated);
    } catch {
      return null;
    }
  },

  // Provider Profiles
  createProviderProfile: async (profile: Omit<ProviderProfile, 'id' | 'rating' | 'totalReviews'>): Promise<ProviderProfile> => {
    const created = await prisma.providerProfile.create({
      data: {
        userId: profile.userId,
        name: profile.name,
        bio: profile.bio,
        experience: profile.experience,
        specialty: profile.specialty,
        profilePhoto: profile.profilePhoto,
        gallery: profile.gallery || [],
        civilId: profile.civilId,
        medicalLicense: profile.medicalLicense,
        iban: profile.iban,
        status: profile.status,
        rejectionReason: profile.rejectionReason,
        emergencyAvailable: profile.emergencyAvailable,
        maxBookingsPerDay: profile.maxBookingsPerDay,
        services: {
          create: (profile.services || []).map((s: Service) => ({
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            category: s.category,
          })),
        },
        availability: {
          create: (profile.availability || []).map((a: AvailabilitySlot) => ({
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
            isAvailable: a.isAvailable,
            isBooked: a.isBooked,
            bookingId: a.bookingId,
          })),
        },
      },
      include: {
        services: true,
        availability: true,
      },
    });
    return prismaProviderToProvider(created);
  },

  getProviderProfile: async (id: string): Promise<ProviderProfile | undefined> => {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        services: true,
        availability: true,
      },
    });
    return provider ? prismaProviderToProvider(provider) : undefined;
  },

  getProviderProfileByUserId: async (userId: string): Promise<ProviderProfile | undefined> => {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        services: true,
        availability: true,
      },
    });
    return provider ? prismaProviderToProvider(provider) : undefined;
  },

  getAllProviders: async (filters?: {
    status?: ProviderProfile['status'];
    emergencyAvailable?: boolean;
    specialty?: string;
  }): Promise<ProviderProfile[]> => {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.emergencyAvailable !== undefined) {
      where.emergencyAvailable = filters.emergencyAvailable;
    }
    if (filters?.specialty) {
      where.specialty = { contains: filters.specialty, mode: 'insensitive' };
    }
    
    const providers = await prisma.providerProfile.findMany({
      where,
      include: {
        services: true,
        availability: true,
      },
    });
    
    return providers.map(prismaProviderToProvider);
  },

  updateProviderProfile: async (id: string, updates: Partial<ProviderProfile>): Promise<ProviderProfile | null> => {
    try {
      const updateData: any = {
        name: updates.name,
        bio: updates.bio,
        experience: updates.experience,
        specialty: updates.specialty,
        profilePhoto: updates.profilePhoto,
        gallery: updates.gallery,
        civilId: updates.civilId,
        medicalLicense: updates.medicalLicense,
        iban: updates.iban,
        status: updates.status,
        rejectionReason: updates.rejectionReason,
        emergencyAvailable: updates.emergencyAvailable,
        maxBookingsPerDay: updates.maxBookingsPerDay,
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const updated = await prisma.providerProfile.update({
        where: { id },
        data: updateData,
        include: {
          services: true,
          availability: true,
        },
      });
      
      return prismaProviderToProvider(updated);
    } catch {
      return null;
    }
  },

  // Bookings
  createBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
    const created = await prisma.booking.create({
      data: {
        userId: booking.userId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        type: booking.type,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        slotId: booking.slotId,
        address: booking.address,
        latitude: booking.latitude,
        longitude: booking.longitude,
        notes: booking.notes,
        status: booking.status,
        servicePrice: booking.servicePrice,
        emergencySurcharge: booking.emergencySurcharge,
        platformCommission: booking.platformCommission,
        totalPrice: booking.totalPrice,
        providerEarnings: booking.providerEarnings,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        paymentMethod: booking.paymentMethod,
        completedAt: booking.completedAt,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason,
        eta: booking.eta,
        assignedAt: booking.assignedAt,
      },
    });
    // Fetch service separately
    const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
    if (!service) {
      throw new Error(`Service not found: ${booking.serviceId}`);
    }
    return prismaBookingToBooking({ ...created, service });
  },

  getBooking: async (id: string): Promise<Booking | undefined> => {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) return undefined;
    const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
    if (!service) {
      throw new Error(`Service not found: ${booking.serviceId}`);
    }
    return prismaBookingToBooking({ ...booking, service });
  },

  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    // Fetch services for all bookings
    const bookingsWithServices = await Promise.all(bookings.map(async (booking) => {
      const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
      return { ...booking, service: service || {} as any };
    }));
    return bookingsWithServices.map(prismaBookingToBooking);
  },

  getProviderBookings: async (providerId: string): Promise<Booking[]> => {
    const bookings = await prisma.booking.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
    // Fetch services for all bookings
    const bookingsWithServices = await Promise.all(bookings.map(async (booking) => {
      const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
      return { ...booking, service: service || {} as any };
    }));
    return bookingsWithServices.map(prismaBookingToBooking);
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Fetch services for all bookings
    const bookingsWithServices = await Promise.all(bookings.map(async (booking) => {
      const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
      return { ...booking, service: service || {} as any };
    }));
    return bookingsWithServices.map(prismaBookingToBooking);
  },

  updateBooking: async (id: string, updates: Partial<Booking>): Promise<Booking | null> => {
    try {
      const updateData: any = {
        status: updates.status,
        scheduledDate: updates.scheduledDate,
        scheduledTime: updates.scheduledTime,
        slotId: updates.slotId,
        address: updates.address,
        latitude: updates.latitude,
        longitude: updates.longitude,
        notes: updates.notes,
        servicePrice: updates.servicePrice,
        emergencySurcharge: updates.emergencySurcharge,
        platformCommission: updates.platformCommission,
        totalPrice: updates.totalPrice,
        providerEarnings: updates.providerEarnings,
        paymentStatus: updates.paymentStatus,
        paymentId: updates.paymentId,
        paymentMethod: updates.paymentMethod,
        completedAt: updates.completedAt,
        cancelledAt: updates.cancelledAt,
        cancellationReason: updates.cancellationReason,
        eta: updates.eta,
        assignedAt: updates.assignedAt,
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const updated = await prisma.booking.update({
        where: { id },
        data: updateData,
      });
      // Fetch service separately
      const service = await prisma.service.findUnique({ where: { id: updated.serviceId } });
      if (!service) {
        throw new Error(`Service not found: ${updated.serviceId}`);
      }
      return prismaBookingToBooking({ ...updated, service });
    } catch {
      return null;
    }
  },

  // Reviews
  createReview: async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> => {
    const created = await prisma.review.create({
      data: {
        bookingId: review.bookingId,
        userId: review.userId,
        providerId: review.providerId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
      },
    });
    
    // Update provider rating if approved
    if (review.status === 'approved') {
      await updateProviderRating(review.providerId);
    }
    
    return prismaReviewToReview(created);
  },

  updateReview: async (id: string, updates: Partial<Review>): Promise<Review | null> => {
    try {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          rating: updates.rating,
          comment: updates.comment,
          status: updates.status,
        },
      });
      
      // Update provider rating if status changed to approved
      if (updates.status === 'approved') {
        await updateProviderRating(updated.providerId);
      }
      
      return prismaReviewToReview(updated);
    } catch {
      return null;
    }
  },

  getProviderReviews: async (providerId: string): Promise<Review[]> => {
    const reviews = await prisma.review.findMany({
      where: {
        providerId,
        status: 'approved',
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(prismaReviewToReview);
  },

  // Payments
  createPayment: async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
    const created = await prisma.payment.create({
      data: {
        bookingId: payment.bookingId,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        knetTransactionId: payment.knetTransactionId,
      },
    });
    return prismaPaymentToPayment(created);
  },

  getPayment: async (id: string): Promise<Payment | undefined> => {
    const payment = await prisma.payment.findUnique({ where: { id } });
    return payment ? prismaPaymentToPayment(payment) : undefined;
  },

  updatePayment: async (id: string, updates: Partial<Payment>): Promise<Payment | null> => {
    try {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          amount: updates.amount,
          status: updates.status,
          knetTransactionId: updates.knetTransactionId,
        },
      });
      return prismaPaymentToPayment(updated);
    } catch {
      return null;
    }
  },

  // System Config
  getSystemConfig: async (): Promise<SystemConfig> => {
    return await ensureSystemConfig();
  },

  updateSystemConfig: async (updates: Partial<SystemConfig>, updatedBy: string): Promise<SystemConfig> => {
    const config = await ensureSystemConfig();
    
    const updated = await prisma.systemConfig.update({
      where: { id: config.id },
      data: {
        platformCommissionPercent: updates.platformCommissionPercent,
        emergencySurchargePercent: updates.emergencySurchargePercent,
        cancellationWindowHours: updates.cancellationWindowHours,
        maxBookingsPerDayPerProvider: updates.maxBookingsPerDayPerProvider,
        updatedBy,
      },
    });
    
    return {
      id: updated.id,
      platformCommissionPercent: updated.platformCommissionPercent,
      emergencySurchargePercent: updated.emergencySurchargePercent,
      cancellationWindowHours: updated.cancellationWindowHours,
      maxBookingsPerDayPerProvider: updated.maxBookingsPerDayPerProvider,
      updatedAt: updated.updatedAt,
      updatedBy: updated.updatedBy,
    };
  },

  // Notifications
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    const created = await prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
      },
    });
    return prismaNotificationToNotification(created);
  },

  getUserNotifications: async (userId: string, unreadOnly = false): Promise<Notification[]> => {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(prismaNotificationToNotification);
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    try {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return true;
    } catch {
      return false;
    }
  },

  // OTP
  setOTP: async (phone: string, code: string, expiresInSeconds = 300): Promise<void> => {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    // Delete existing OTPs for this phone
    await prisma.oTP.deleteMany({
      where: { phone },
    });
    
    // Create new OTP
    await prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] OTP stored for ${phone}: ${code} (expires in ${expiresInSeconds}s)`);
    }
  },

  verifyOTP: async (phone: string, code: string): Promise<boolean> => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Verifying OTP for ${phone}: ${code}`);
    }
    
    // Clean up expired OTPs
    await prisma.oTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    
    const otp = await prisma.oTP.findFirst({
      where: {
        phone,
        code,
        expiresAt: { gt: new Date() },
      },
    });
    
    if (!otp) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB] OTP not found or expired for phone: ${phone}`);
      }
      return false;
    }
    
    // Delete the OTP after verification
    await prisma.oTP.delete({
      where: { id: otp.id },
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] OTP verified successfully for ${phone}`);
    }
    return true;
  },

  // Availability Slots
  getProviderAvailability: async (providerId: string, date?: string): Promise<AvailabilitySlot[]> => {
    const where: any = { providerId };
    if (date) {
      where.date = date;
    }
    
    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
    
    return slots.map((slot: any) => ({
      id: slot.id,
      providerId: slot.providerId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      isBooked: slot.isBooked,
      bookingId: slot.bookingId || undefined,
    }));
  },

  updateAvailabilitySlot: async (providerId: string, slotId: string, updates: Partial<AvailabilitySlot>): Promise<boolean> => {
    try {
      await prisma.availabilitySlot.update({
        where: { id: slotId },
        data: {
          isAvailable: updates.isAvailable,
          isBooked: updates.isBooked,
          bookingId: updates.bookingId,
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Additional helper methods for admin operations
  getProviderServices: async (providerId: string): Promise<Service[]> => {
    const services = await prisma.service.findMany({
      where: { providerId },
    });
    return services.map((s: any) => ({
      id: s.id,
      providerId: s.providerId,
      name: s.name,
      description: s.description || undefined,
      price: s.price,
      duration: s.duration,
      category: s.category as any,
    }));
  },

  updateProviderService: async (serviceId: string, updates: Partial<Service>): Promise<Service | null> => {
    try {
      const updated = await prisma.service.update({
        where: { id: serviceId },
        data: {
          name: updates.name,
          description: updates.description,
          price: updates.price,
          duration: updates.duration,
          category: updates.category,
        },
      });
      return {
        id: updated.id,
        providerId: updated.providerId,
        name: updated.name,
        description: updated.description || undefined,
        price: updated.price,
        duration: updated.duration,
        category: updated.category as any,
      };
    } catch {
      return null;
    }
  },

  deleteProviderService: async (serviceId: string): Promise<boolean> => {
    try {
      await prisma.service.delete({ where: { id: serviceId } });
      return true;
    } catch {
      return false;
    }
  },

  createService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    const created = await prisma.service.create({
      data: {
        providerId: service.providerId,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
      },
    });
    return {
      id: created.id,
      providerId: created.providerId,
      name: created.name,
      description: created.description || undefined,
      price: created.price,
      duration: created.duration,
      category: created.category as any,
    };
  },
};

// Helper function to update provider rating
async function updateProviderRating(providerId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: {
      providerId,
      status: 'approved',
    },
  });
  
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;
  
  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      rating: avgRating,
      totalReviews: reviews.length,
    },
  });
}
