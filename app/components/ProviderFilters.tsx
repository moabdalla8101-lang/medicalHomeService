'use client';

import { X } from 'lucide-react';
import { ServiceType } from '@/lib/types';

interface ProviderFiltersProps {
  filters: {
    search: string;
    serviceType: string;
    minRating: string;
    maxPrice: string;
    availableNow: boolean;
    emergencyAvailable: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export default function ProviderFilters({ filters, onFiltersChange, onClose }: ProviderFiltersProps) {
  const serviceTypes: { value: ServiceType | ''; label: string }[] = [
    { value: '', label: 'جميع الخدمات' },
    { value: 'general_consultation', label: 'استشارة عامة' },
    { value: 'pediatric', label: 'طب الأطفال' },
    { value: 'geriatric', label: 'طب المسنين' },
    { value: 'wound_care', label: 'العناية بالجروح' },
    { value: 'injection', label: 'حقن' },
    { value: 'blood_test', label: 'فحص الدم' },
    { value: 'physiotherapy', label: 'العلاج الطبيعي' },
    { value: 'nursing_care', label: 'الرعاية التمريضية' },
    { value: 'other', label: 'أخرى' },
  ];

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex items-center justify-between mb-4 flex-row-reverse">
        <h3 className="text-lg font-semibold text-right">تصفية حسب</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            نوع الخدمة
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
            dir="rtl"
          >
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            الحد الأدنى للتقييم
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onFiltersChange({ ...filters, minRating: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
            dir="rtl"
          >
            <option value="">أي</option>
            <option value="4">4+ نجوم</option>
            <option value="4.5">4.5+ نجوم</option>
            <option value="4.8">4.8+ نجوم</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            الحد الأقصى للسعر (د.ك)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
            placeholder="بدون حد"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
            dir="ltr"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            خيارات
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-row-reverse">
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => onFiltersChange({ ...filters, availableNow: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">متاح الآن</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-row-reverse">
            <input
              type="checkbox"
              checked={filters.emergencyAvailable}
              onChange={(e) => onFiltersChange({ ...filters, emergencyAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">متاح للطوارئ</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-start">
        <button
          onClick={() => onFiltersChange({
            search: '',
            serviceType: '',
            minRating: '',
            maxPrice: '',
            availableNow: false,
            emergencyAvailable: false,
          })}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          مسح جميع الفلاتر
        </button>
      </div>
    </div>
  );
}
