'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Booking #{booking.id.slice(0, 8)}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {booking.scheduledDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.scheduledDate).toLocaleDateString()} {booking.scheduledTime}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{booking.totalPrice} KWD</p>
                <p className="text-sm text-gray-500">Commission: {booking.commission} KWD</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{booking.address}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

