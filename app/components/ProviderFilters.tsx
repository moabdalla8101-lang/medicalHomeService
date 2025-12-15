'use client';

import { X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
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
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const serviceTypes: { value: ServiceType | ''; label: string }[] = [
    { value: '', label: t('filters.allServices') },
    { value: 'general_consultation', label: t('filters.generalConsultation') },
    { value: 'pediatric', label: t('filters.pediatric') },
    { value: 'geriatric', label: t('filters.geriatric') },
    { value: 'wound_care', label: t('filters.woundCare') },
    { value: 'injection', label: t('filters.injection') },
    { value: 'blood_test', label: t('filters.bloodTest') },
    { value: 'physiotherapy', label: t('filters.physiotherapy') },
    { value: 'nursing_care', label: t('filters.nursingCare') },
    { value: 'other', label: t('filters.other') },
  ];

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('home.filterBy')}</h3>
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
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('home.serviceType')}
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
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
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('filters.minRating')}
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onFiltersChange({ ...filters, minRating: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{t('filters.any')}</option>
            <option value="4">4+ {t('filters.stars')}</option>
            <option value="4.5">4.5+ {t('filters.stars')}</option>
            <option value="4.8">4.8+ {t('filters.stars')}</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('filters.maxPrice')} (KWD)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
            placeholder={t('filters.noLimit')}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isRTL ? 'text-right' : 'text-left'}`}
            dir="ltr"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('filters.options')}
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => onFiltersChange({ ...filters, availableNow: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t('filters.availableNow')}</span>
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              checked={filters.emergencyAvailable}
              onChange={(e) => onFiltersChange({ ...filters, emergencyAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t('filters.emergencyAvailable')}</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
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
          {t('filters.clearAll')}
        </button>
      </div>
    </div>
  );
}

