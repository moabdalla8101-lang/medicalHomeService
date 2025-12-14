// Core User Types
export type UserRole = 'user' | 'provider' | 'admin' | 'medical_centre';

export interface User {
  id: string;
  phone: string; // Kuwait format: +965XXXXXXXX
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  // User-specific fields
  name?: string;
  address?: string;
  // Medical Centre Admin
  medicalCentreId?: string;
  medicalCentre?: MedicalCentre;
  // Provider-specific fields
  providerProfile?: ProviderProfile;
  // Session
  sessionToken?: string;
  sessionExpiry?: Date;
}

export interface MedicalCentre {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  license?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  // Personal Info
  name: string;
  bio?: string;
  experience?: number; // years
  profilePhoto?: string;
  gallery?: string[]; // photo URLs
  // Documents
  civilId?: string;
  medicalLicense?: string;
  // Financial
  iban?: string;
  // Medical Centre
  medicalCentreId?: string;
  medicalCentre?: MedicalCentre;
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  // Services
  specialty: string;
  services: Service[];
  // Availability
  emergencyAvailable: boolean;
  availability: AvailabilitySlot[];
  // Ratings
  rating: number;
  totalReviews: number;
  // Settings
  maxBookingsPerDay: number;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // minutes
  category: ServiceType;
}

export type ServiceType = 
  | 'general_consultation'
  | 'pediatric'
  | 'geriatric'
  | 'wound_care'
  | 'injection'
  | 'blood_test'
  | 'physiotherapy'
  | 'nursing_care'
  | 'other';

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
}

// Booking Types
export type BookingStatus = 
  | 'requested'
  | 'confirmed'
  | 'assigned'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BookingType = 'standard' | 'emergency';

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  // Service
  serviceId: string;
  service: Service;
  // Timing
  type: BookingType;
  scheduledDate?: string; // YYYY-MM-DD (for standard bookings)
  scheduledTime?: string; // HH:mm (for standard bookings)
  slotId?: string; // for standard bookings
  // Location
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  // Status
  status: BookingStatus;
  // Pricing
  servicePrice: number;
  emergencySurcharge?: number;
  platformCommission: number;
  totalPrice: number;
  providerEarnings: number;
  // Payment
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  paymentMethod?: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  // Emergency specific
  eta?: number; // minutes
  assignedAt?: Date;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number; // 1-5
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string; // KWD
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'knet';
  knetTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// System Configuration
export interface SystemConfig {
  id: string;
  platformCommissionPercent: number; // e.g., 15
  emergencySurchargePercent: number; // e.g., 25
  cancellationWindowHours: number; // e.g., 24
  maxBookingsPerDayPerProvider: number; // e.g., 10
  updatedAt: Date;
  updatedBy: string; // admin userId
}

// Filter Types
export interface ProviderFilters {
  serviceType?: ServiceType;
  gender?: 'male' | 'female';
  minRating?: number;
  maxPrice?: number;
  availableNow?: boolean;
  emergencyAvailable?: boolean;
  searchQuery?: string;
}

// Notification Types
export type NotificationType = 
  | 'booking_confirmed'
  | 'emergency_assigned'
  | 'booking_cancelled'
  | 'provider_on_the_way'
  | 'booking_completed'
  | 'payout_processed'
  | 'provider_approved'
  | 'provider_rejected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Analytics Types
export interface Analytics {
  date: string;
  totalBookings: number;
  emergencyBookings: number;
  scheduledBookings: number;
  totalRevenue: number;
  platformCommission: number;
  providerEarnings: number;
  averageRating: number;
  activeProviders: number;
  activeUsers: number;
}

// API Response Types
export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  expiresIn: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
