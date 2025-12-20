'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Star, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import RatingModal from './RatingModal';

interface Booking {
  id: string;
  status: string;
  type: string;
  service: string;
  serviceId: string;
  providerId: string;
  totalPrice: number;
  scheduledDate?: string;
  scheduledTime?: string;
  address: string;
  createdAt: string;
  hasReview: boolean;
}

export default function UserBookings({ showHistory = false }: { showHistory?: boolean }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    providerName: string;
    serviceName: string;
  }>({
    isOpen: false,
    bookingId: '',
    providerName: '',
    serviceName: '',
  });
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allBookings = data.bookings || [];
        
        // Filter bookings based on showHistory
        const filteredBookings = showHistory
          ? allBookings.filter((b: Booking) => 
              b.status === 'completed' || b.status === 'cancelled'
            )
          : allBookings.filter((b: Booking) => 
              b.status !== 'completed' && b.status !== 'cancelled'
            );
        
        setBookings(filteredBookings);
        
        // Fetch provider names for completed bookings
        const providerIds = Array.from(new Set(filteredBookings.map((b: Booking) => b.providerId)));
        await fetchProviderNames(providerIds);
      } else {
        const errorData = await response.json();
        toast.error('فشل تحميل الحجوزات', {
          style: {
            direction: 'rtl',
            textAlign: 'right',
          },
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الحجوزات', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderNames = async (providerIds: string[]) => {
    const names: Record<string, string> = {};
    await Promise.all(
      providerIds.map(async (providerId) => {
        try {
          const response = await fetch(`/api/providers/${providerId}`);
          if (response.ok) {
            const data = await response.json();
            names[providerId] = data.provider?.name || 'مقدم خدمة';
          }
        } catch (error) {
          names[providerId] = 'مقدم خدمة';
        }
      })
    );
    setProviderNames(names);
  };

  const handleRateProvider = (booking: Booking) => {
    setRatingModal({
      isOpen: true,
      bookingId: booking.id,
      providerName: providerNames[booking.providerId] || 'مقدم خدمة',
      serviceName: booking.service,
    });
  };

  const handleRatingSuccess = () => {
    fetchBookings();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      requested: 'مطلوب',
      confirmed: 'مؤكد',
      in_progress: 'قيد التنفيذ',
      on_the_way: 'في الطريق',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      on_the_way: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-500 text-right">
          {showHistory ? 'لا توجد حجوزات سابقة' : 'لا توجد حجوزات حالية'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" dir="rtl">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-4 flex-row-reverse">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-right">{booking.service}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-row-reverse">
                  {booking.scheduledDate && (
                    <span className="flex items-center gap-1 flex-row-reverse">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.scheduledDate).toLocaleDateString('ar-KW')} {booking.scheduledTime && `- ${booking.scheduledTime}`}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-blue-600">{booking.totalPrice} د.ك</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-row-reverse">
              <MapPin className="w-4 h-4" />
              <span className="text-right">{booking.address}</span>
            </div>

            {/* Rating Button for Completed Bookings */}
            {showHistory && booking.status === 'completed' && !booking.hasReview && (
              <button
                onClick={() => handleRateProvider(booking)}
                className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 flex-row-reverse"
              >
                <Star className="w-5 h-5" />
                قيّم مقدم الخدمة
              </button>
            )}

            {showHistory && booking.status === 'completed' && booking.hasReview && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-right">
                <p className="text-sm text-green-700 flex items-center gap-2 flex-row-reverse">
                  <CheckCircle className="w-4 h-4" />
                  تم إرسال التقييم
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
        bookingId={ratingModal.bookingId}
        providerName={ratingModal.providerName}
        serviceName={ratingModal.serviceName}
        onSuccess={handleRatingSuccess}
      />
    </>
  );
}

