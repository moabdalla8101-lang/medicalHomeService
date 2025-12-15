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
      toast.error('اختر الخدمة', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
      return;
    }
    if (step === 'datetime' && (!selectedDate || !selectedSlot)) {
      toast.error('يرجى اختيار التاريخ والوقت', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
      return;
    }
    if (step === 'address' && !address.trim()) {
      toast.error('يرجى إدخال العنوان', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
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
        toast.error('يجب تسجيل الدخول للمتابعة', {
          style: {
            direction: 'rtl',
            textAlign: 'right',
          }
        });
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
        throw new Error(data.error || 'فشل إنشاء الحجز');
      }

      // Store booking ID and show confirmation
      setBookingId(data.booking?.id || null);
      setStep('confirmation');
      toast.success(type === 'emergency' ? 'تم إرسال طلب الطوارئ!' : 'تم تأكيد الحجز', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الحجز', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-right" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between flex-row-reverse">
          <h2 className="text-xl sm:text-2xl font-bold text-right">
            {type === 'emergency' ? 'حجز طوارئ' : 'حجز موعد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-right" dir="rtl">
          {/* Service Selection */}
          {step === 'service' && (
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-4 text-right">اختر الخدمة</h3>
              <div className="space-y-2">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedService === s.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } flex-row-reverse`}
                  >
                    <div className="text-right">
                      <input
                        type="radio"
                        name="service"
                        value={s.id}
                        checked={selectedService === s.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({s.duration} دقيقة)
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
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-4 text-right">اختر التاريخ والوقت</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  التاريخ
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
                      {new Date(day.date).toLocaleDateString('ar-KW', {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    الوقت
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
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-4 text-right">عنوان الخدمة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    العنوان الكامل *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل عنوانك الكامل"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات إضافية..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {type === 'emergency' ? 'تم استلام طلب الطوارئ!' : 'تم تأكيد الحجز'}
              </h3>
              <p className="text-lg text-gray-600 mb-2 text-center">
                لقد استلمنا طلبك وسنتواصل معك قريباً
              </p>
              <p className="text-sm text-gray-500 mb-6 text-center">
                {type === 'emergency' 
                  ? 'فريقنا يبحث عن أقرب مقدم خدمة متاح لك'
                  : 'ستتلقى مكالمة تأكيد قريباً'}
              </p>
              {bookingId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-gray-600">رقم الحجز</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{bookingId}</p>
                </div>
              )}
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* Review */}
          {step === 'review' && service && (
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-4 text-right">مراجعة وتأكيد</h3>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg text-right">
                <div>
                  <p className="text-sm text-gray-600">الخدمة</p>
                  <p className="font-semibold">{service.name}</p>
                </div>
                {type === 'standard' && selectedDate && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">التاريخ والوقت</p>
                      <p className="font-semibold">
                        {new Date(selectedDate).toLocaleDateString('ar-KW', {
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
                  <p className="text-sm text-gray-600">العنوان</p>
                  <p className="font-semibold">{address}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2 flex-row-reverse">
                    <span>سعر الخدمة</span>
                    <span>{service.price} د.ك</span>
                  </div>
                  {type === 'emergency' && (
                    <div className="flex justify-between mb-2 text-red-600 flex-row-reverse">
                      <span>رسوم الطوارئ (25%)</span>
                      <span>{(service.price * 0.25).toFixed(2)} د.ك</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2 text-gray-600 flex-row-reverse">
                    <span>عمولة المنصة (15%)</span>
                    <span>{(calculateTotal() - service.price - (type === 'emergency' ? service.price * 0.25 : 0)).toFixed(2)} د.ك</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 flex-row-reverse">
                    <span>الإجمالي</span>
                    <span>{calculateTotal().toFixed(2)} د.ك</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step !== 'confirmation' && (
            <div className="flex justify-between pt-4 border-t flex-row-reverse">
              <button
                onClick={() => {
                  if (step === 'datetime') setStep('service');
                  else if (step === 'address') setStep(type === 'emergency' ? 'address' : 'datetime');
                  else if (step === 'review') setStep('address');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {step === 'service' ? 'إلغاء' : 'رجوع'}
              </button>
              {step === 'review' ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? 'جاري المعالجة...' : 'تأكيد والدفع'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  التالي
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

