import { db } from './db';
import { Booking, BookingType, Service, SystemConfig } from './types';

export interface CreateBookingParams {
  userId: string;
  providerId: string;
  serviceId: string;
  type: BookingType;
  scheduledDate?: string;
  scheduledTime?: string;
  slotId?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const config = await db.getSystemConfig();
  const provider = await db.getProviderProfile(params.providerId);
  
  if (!provider) {
    throw new Error('Provider not found');
  }
  
  if (provider.status !== 'approved') {
    throw new Error('Provider is not approved');
  }
  
  const service = provider.services.find(s => s.id === params.serviceId);
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Calculate pricing
  let servicePrice = service.price;
  let emergencySurcharge = 0;
  
  if (params.type === 'emergency') {
    emergencySurcharge = servicePrice * (config.emergencySurchargePercent / 100);
  }
  
  const subtotal = servicePrice + emergencySurcharge;
  const platformCommission = subtotal * (config.platformCommissionPercent / 100);
  const totalPrice = subtotal + platformCommission;
  const providerEarnings = subtotal - platformCommission;
  
  // Handle slot booking for standard bookings
  if (params.type === 'standard' && params.slotId) {
    const slotUpdated = await db.updateAvailabilitySlot(
      params.providerId,
      params.slotId,
      {
        isBooked: true,
        isAvailable: false,
        bookingId: '', // Will be set after booking creation
      }
    );
    
    if (!slotUpdated) {
      throw new Error('Slot is no longer available');
    }
  }
  
  // Create booking
  const booking = await db.createBooking({
    userId: params.userId,
    providerId: params.providerId,
    serviceId: params.serviceId,
    service,
    type: params.type,
    scheduledDate: params.scheduledDate,
    scheduledTime: params.scheduledTime,
    slotId: params.slotId,
    address: params.address,
    latitude: params.latitude,
    longitude: params.longitude,
    notes: params.notes,
    status: params.type === 'emergency' ? 'requested' : 'confirmed',
    servicePrice,
    emergencySurcharge: params.type === 'emergency' ? emergencySurcharge : undefined,
    platformCommission,
    totalPrice,
    providerEarnings,
    paymentStatus: 'pending',
  });
  
  // Update slot with booking ID
  if (params.slotId) {
    await db.updateAvailabilitySlot(params.providerId, params.slotId, {
      bookingId: booking.id,
    });
  }
  
  // Create notification
  await db.createNotification({
    userId: params.userId,
    type: params.type === 'emergency' ? 'emergency_assigned' : 'booking_confirmed',
    title: params.type === 'emergency' 
      ? 'Emergency Request Submitted'
      : 'Booking Confirmed',
    message: params.type === 'emergency'
      ? 'Your emergency request has been submitted. We are finding the nearest available provider.'
      : `Your booking with ${provider.name} has been confirmed.`,
    data: { bookingId: booking.id },
    read: false,
  });
  
  // If provider, notify them too
  const providerUser = await db.getUserById(provider.userId);
  if (providerUser) {
    await db.createNotification({
      userId: providerUser.id,
      type: 'booking_confirmed',
      title: 'New Booking',
      message: `You have a new ${params.type} booking.`,
      data: { bookingId: booking.id },
      read: false,
    });
  }
  
  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  updatedBy: 'user' | 'provider' | 'admin',
  cancellationReason?: string
): Promise<Booking | null> {
  const booking = await db.getBooking(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  const updates: Partial<Booking> = {
    status,
    ...(cancellationReason && {
      cancellationReason,
      cancelledAt: new Date(),
    }),
    ...(status === 'completed' && {
      completedAt: new Date(),
    }),
    ...(status === 'on_the_way' && {
      assignedAt: new Date(),
    }),
  };
  
  const updated = await db.updateBooking(bookingId, updates);
  if (!updated) return null;
  
  // Create notifications
  const notificationType: Record<Booking['status'], string> = {
    cancelled: 'booking_cancelled',
    on_the_way: 'provider_on_the_way',
    completed: 'booking_completed',
    requested: 'booking_confirmed',
    confirmed: 'booking_confirmed',
    assigned: 'emergency_assigned',
    in_progress: 'booking_confirmed',
  };
  
  await db.createNotification({
    userId: booking.userId,
    type: notificationType[status] as any,
    title: `Booking ${status.replace('_', ' ')}`,
    message: `Your booking status has been updated to ${status}.`,
    data: { bookingId: booking.id },
    read: false,
  });
  
  return updated;
}

