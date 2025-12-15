'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Clock, AlertCircle, Calendar, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react';
import BookingModal from './BookingModal';
import PhoneAuth from './PhoneAuth';

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
      alert('لا توجد خدمات متاحة');
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
      alert('لا توجد خدمات متاحة');
      return;
    }
    setSelectedService(provider.services[0].id);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-right" dir="rtl">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            {/* Back Button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-row-reverse"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
              <span className="font-medium">العودة للصفحة الرئيسية</span>
            </button>
          </div>
          
          {/* Use CSS Grid for better RTL control */}
          <div 
            className="grid grid-cols-[1fr_auto] gap-6 items-start"
            style={{ direction: 'rtl' }}
          >
            {/* Profile Photo */}
            <div 
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 order-2"
            >
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

            {/* Info Section */}
            <div 
              className="flex-1 text-right order-1"
              style={{ direction: 'rtl' }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-right">{provider.name}</h1>
              <p className="text-base sm:text-lg text-gray-600 mb-2 text-right">{provider.specialty}</p>
              
              {/* Medical Centre */}
              {provider.medicalCentre && (
                <div className="flex items-start gap-2 text-gray-600 mb-4 flex-row-reverse justify-end">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-right">
                    <div className="font-medium">{provider.medicalCentre.name}</div>
                    {provider.medicalCentre.address && (
                      <div className="text-sm text-gray-500 mt-1">
                        {provider.medicalCentre.address}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 flex-row-reverse justify-end">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span className="text-lg font-semibold">{provider.rating.toFixed(1)}</span>
                <span className="text-gray-500">({provider.totalReviews} تقييمات)</span>
              </div>

              {/* Experience */}
              {provider.experience && (
                <div className="flex items-center gap-2 text-gray-600 mb-4 flex-row-reverse justify-end">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span>{provider.experience} سنوات الخبرة</span>
                </div>
              )}

              {/* Emergency Badge */}
              {provider.emergencyAvailable && (
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-4 flex-row-reverse ml-auto">
                  <AlertCircle className="w-4 h-4" />
                  متاح للطوارئ
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3 mt-6 flex-wrap flex-row-reverse justify-end">
                <button
                  onClick={() => handleBook('standard')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  احجز موعد
                </button>
                {provider.emergencyAvailable && (
                  <button
                    onClick={() => handleBook('emergency')}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 text-sm sm:text-base flex-row-reverse"
                  >
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                    حجز طوارئ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-right" dir="rtl">
        {/* Bio */}
        {provider.bio && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-right">نبذة</h2>
            <p className="text-gray-700 leading-relaxed text-right">{provider.bio}</p>
          </div>
        )}

        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-right">الخدمات & السعر</h2>
          <div className="space-y-3">
            {provider.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex-row-reverse"
              >
                <div className="text-right">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-row-reverse">
                    <span className="flex items-center gap-1 flex-row-reverse">
                      <Clock className="w-4 h-4" />
                      {service.duration} دقيقة
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-blue-600">{service.price} د.ك</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-right">التوفر</h2>
          <div className="space-y-4">
            {provider.availability.map((day) => (
              <div key={day.date} className="border-b border-gray-200 pb-4 last:border-0 text-right">
                <h3 className="font-semibold mb-2">
                  {new Date(day.date).toLocaleDateString('ar-KW', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                {day.slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2 flex-row-reverse">
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
                  <p className="text-gray-500 text-sm">لا توجد مواعيد متاحة</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 flex-row-reverse text-right">
            <MessageSquare className="w-6 h-6" />
            تقييمات ({provider.totalReviews})
          </h2>
          {provider.reviews.length > 0 ? (
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 text-right">
                  <div className="flex items-center gap-2 mb-2 flex-row-reverse">
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
                      {new Date(review.createdAt).toLocaleDateString('ar-KW')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-right">لا توجد تقييمات بعد</p>
          )}
        </div>

        {/* Gallery */}
        {provider.gallery && provider.gallery.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-right">معرض الصور</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {provider.gallery.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={photo}
                    alt={`معرض الصور ${index + 1}`}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-right">تسجيل الدخول مطلوب</h2>
              <p className="text-gray-600 mb-6 text-right">
                يرجى التحقق من رقم هاتفك لحجز موعد
              </p>
              <PhoneAuth 
                onSuccess={handleAuthSuccess} 
                role="user"
              />
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 w-full text-gray-600 hover:text-gray-900 text-sm text-right"
              >
                إلغاء
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

