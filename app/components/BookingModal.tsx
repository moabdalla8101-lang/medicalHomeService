'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingModalProps {
  providerId: string;
  serviceId: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  availability: Array<{
    date: string;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
  type: 'standard' | 'emergency';
  onClose: () => void;
}

export default function BookingModal({
  providerId,
  serviceId,
  services,
  availability,
  type,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState<'service' | 'datetime' | 'address' | 'review' | 'confirmation'>(
    type === 'emergency' ? 'address' : 'service'
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(serviceId);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const service = services.find(s => s.id === selectedService);
  const selectedDateSlots = availability.find(a => a.date === selectedDate)?.slots || [];

  const handleNext = () => {
    if (step === 'service' && !selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (step === 'datetime' && (!selectedDate || !selectedSlot)) {
      toast.error('Please select date and time');
      return;
    }
    if (step === 'address' && !address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    
    if (step === 'service') setStep('datetime');
    else if (step === 'datetime') setStep('address');
    else if (step === 'address') setStep('review');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        onClose(); // Close modal so user can login
        return;
      }

      const bookingData: any = {
        providerId,
        serviceId: selectedService,
        type,
        address,
        notes: notes.trim() || undefined,
      };

      if (type === 'standard') {
        bookingData.scheduledDate = selectedDate;
        bookingData.scheduledTime = selectedDateSlots.find(s => s.id === selectedSlot)?.startTime;
        bookingData.slotId = selectedSlot;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Store booking ID and show confirmation
      setBookingId(data.booking?.id || null);
      setStep('confirmation');
      toast.success(type === 'emergency' ? 'Emergency request submitted!' : 'Booking confirmed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service) return 0;
    let total = service.price;
    if (type === 'emergency') {
      total += service.price * 0.25; // 25% emergency surcharge
    }
    total += total * 0.15; // 15% platform commission
    return total;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {type === 'emergency' ? 'Emergency Booking' : 'Book Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Selection */}
          {step === 'service' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Service</h3>
              <div className="space-y-2">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedService === s.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <input
                        type="radio"
                        name="service"
                        value={s.id}
                        checked={selectedService === s.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({s.duration} min)
                      </span>
                    </div>
                    <span className="font-bold text-blue-600">{s.price} KWD</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date & Time Selection */}
          {step === 'datetime' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availability.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedSlot('');
                      }}
                      className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                        selectedDate === day.date
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                          selectedSlot === slot.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {step === 'address' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {type === 'emergency' ? 'Emergency Request Received!' : 'Booking Confirmed!'}
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                We have received your {type === 'emergency' ? 'emergency request' : 'booking'} and will contact you ASAP.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {type === 'emergency' 
                  ? 'Our team is finding the nearest available provider for you.'
                  : 'You will receive a confirmation call shortly.'}
              </p>
              {bookingId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{bookingId}</p>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}

          {/* Review */}
          {step === 'review' && service && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Confirm</h3>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-semibold">{service.name}</p>
                </div>
                {type === 'standard' && selectedDate && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' '}
                        {selectedDateSlots.find(s => s.id === selectedSlot)?.startTime}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{address}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Service Price</span>
                    <span>{service.price} KWD</span>
                  </div>
                  {type === 'emergency' && (
                    <div className="flex justify-between mb-2 text-red-600">
                      <span>Emergency Surcharge (25%)</span>
                      <span>{(service.price * 0.25).toFixed(2)} KWD</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2 text-gray-600">
                    <span>Platform Commission (15%)</span>
                    <span>{(calculateTotal() - service.price - (type === 'emergency' ? service.price * 0.25 : 0)).toFixed(2)} KWD</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{calculateTotal().toFixed(2)} KWD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step !== 'confirmation' && (
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => {
                  if (step === 'datetime') setStep('service');
                  else if (step === 'address') setStep(type === 'emergency' ? 'address' : 'datetime');
                  else if (step === 'review') setStep('address');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {step === 'service' ? 'Cancel' : 'Back'}
              </button>
              {step === 'review' ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

