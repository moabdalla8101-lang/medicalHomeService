'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerName: string;
  serviceName: string;
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  bookingId,
  providerName,
  serviceName,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('يرجى اختيار التقييم', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إرسال التقييم');
      }

      toast.success('تم إرسال التقييم بنجاح. سيتم مراجعته من قبل الإدارة', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
        duration: 4000,
      });

      // Reset form
      setRating(0);
      setComment('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال التقييم', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">تقييم الخدمة</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">مقدم الخدمة:</span> {providerName}
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">الخدمة:</span> {serviceName}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
            التقييم *
          </label>
          <div className="flex gap-2 justify-end">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            تعليق (اختياري)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا تجربتك..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
            rows={4}
            dir="rtl"
          />
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

