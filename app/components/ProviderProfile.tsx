'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Star, MapPin, Clock, AlertCircle, Calendar, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react';
import BookingModal from './BookingModal';
import PhoneAuth from './PhoneAuth';
import LanguageSwitcher from './LanguageSwitcher';

interface ProviderProfileProps {
  provider: {
    id: string;
    name: string;
    specialty: string;
    bio?: string;
    experience?: number;
    profilePhoto?: string;
    gallery?: string[];
    rating: number;
    totalReviews: number;
    emergencyAvailable: boolean;
    services: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      duration: number;
      category: string;
    }>;
    availability: Array<{
      date: string;
      slots: Array<{
        id: string;
        startTime: string;
        endTime: string;
      }>;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment?: string;
      createdAt: Date;
    }>;
    medicalCentre?: {
      id: string;
      name: string;
      address?: string;
      phone?: string;
    };
  };
}

export default function ProviderProfile({ provider }: ProviderProfileProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookingType, setBookingType] = useState<'standard' | 'emergency'>('standard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    // Now proceed with booking
    handleBookAfterAuth();
  };

  const handleBook = (type: 'standard' | 'emergency') => {
    if (provider.services.length === 0) {
      alert(t('booking.noServicesAvailable') || 'No services available');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setBookingType(type);
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, proceed with booking
    setBookingType(type);
    setSelectedService(provider.services[0].id);
    setShowBookingModal(true);
  };

  const handleBookAfterAuth = () => {
    if (provider.services.length === 0) {
      alert('No services available');
      return;
    }
    setSelectedService(provider.services[0].id);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Back Button */}
            <button
              onClick={() => router.push(`/${locale}`)}
              className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="font-medium">{t('provider.backToHome')}</span>
            </button>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
          
          <div className={`flex items-start gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Profile Photo */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
              {provider.profilePhoto ? (
                <img
                  src={provider.profilePhoto}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-600">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
              <p className="text-base sm:text-lg text-gray-600 mb-2">{provider.specialty}</p>
              
              {/* Medical Centre */}
              {provider.medicalCentre && (
                <div className={`flex items-center gap-2 text-gray-600 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-5 h-5" />
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <span className="font-medium">{provider.medicalCentre.name}</span>
                    {provider.medicalCentre.address && (
                      <span className={`text-sm text-gray-500 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                        - {provider.medicalCentre.address}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Rating */}
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{provider.rating.toFixed(1)}</span>
                <span className="text-gray-500">({provider.totalReviews} {t('provider.reviews')})</span>
              </div>

              {/* Experience */}
              {provider.experience && (
                <div className={`flex items-center gap-2 text-gray-600 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-5 h-5" />
                  <span>{provider.experience} {t('provider.experience')}</span>
                </div>
              )}

              {/* Emergency Badge */}
              {provider.emergencyAvailable && (
                <div className={`inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle className="w-4 h-4" />
                  {t('provider.emergencyAvailable')}
                </div>
              )}

              {/* CTAs */}
              <div className={`flex gap-3 mt-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => handleBook('standard')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {t('provider.bookAppointment')}
                </button>
                {provider.emergencyAvailable && (
                  <button
                    onClick={() => handleBook('emergency')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 text-sm sm:text-base ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                    {t('provider.emergencyBooking')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Bio */}
        {provider.bio && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('provider.bio')}</h2>
            <p className={`text-gray-700 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{provider.bio}</p>
          </div>
        )}

        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('provider.services')} & {t('home.price')}</h2>
          <div className="space-y-3">
            {provider.services.map((service) => (
              <div
                key={service.id}
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className={`flex items-center gap-4 mt-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4" />
                      {service.duration} {t('common.minutes')}
                    </span>
                  </div>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <p className="text-xl font-bold text-blue-600">{service.price} KWD</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('provider.availability')}</h2>
          <div className="space-y-4">
            {provider.availability.map((day) => (
              <div key={day.date} className={`border-b border-gray-200 pb-4 last:border-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="font-semibold mb-2">
                  {new Date(day.date).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                {day.slots.length > 0 ? (
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {day.slots.map((slot) => (
                      <span
                        key={slot.id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                      >
                        {slot.startTime} - {slot.endTime}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{t('provider.noAvailableSlots') || 'No available slots'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <MessageSquare className="w-6 h-6" />
            {t('provider.reviews')} ({provider.totalReviews})
          </h2>
          {provider.reviews.length > 0 ? (
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet</p>
          )}
        </div>

        {/* Gallery */}
        {provider.gallery && provider.gallery.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {provider.gallery.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={photo}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                Please verify your phone number to book an appointment.
              </p>
              <PhoneAuth 
                onSuccess={handleAuthSuccess} 
                role="user"
              />
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 w-full text-gray-600 hover:text-gray-900 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          providerId={provider.id}
          serviceId={selectedService}
          services={provider.services}
          availability={provider.availability}
          type={bookingType}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

