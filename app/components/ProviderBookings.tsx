'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.json();
        console.error('Error fetching bookings:', errorData);
        toast.error(errorData.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Booking status updated');
        fetchBookings();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{booking.service}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {booking.scheduledDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(booking.scheduledDate).toLocaleDateString()} {booking.scheduledTime}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'on_the_way' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">{booking.totalPrice} KWD</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{booking.address}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {booking.status === 'confirmed' && (
              <button
                onClick={() => updateBookingStatus(booking.id, 'on_the_way')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Mark as On the Way
              </button>
            )}
            {booking.status === 'on_the_way' && (
              <button
                onClick={() => updateBookingStatus(booking.id, 'completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                Mark as Completed
              </button>
            )}
            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <button
                onClick={() => {
                  const reason = prompt('Cancellation reason:');
                  if (reason) {
                    updateBookingStatus(booking.id, 'cancelled');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

