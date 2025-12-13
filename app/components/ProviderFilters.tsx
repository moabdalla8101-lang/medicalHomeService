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

const serviceTypes: { value: ServiceType | ''; label: string }[] = [
  { value: '', label: 'All Services' },
  { value: 'general_consultation', label: 'General Consultation' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'geriatric', label: 'Geriatric' },
  { value: 'wound_care', label: 'Wound Care' },
  { value: 'injection', label: 'Injection' },
  { value: 'blood_test', label: 'Blood Test' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'nursing_care', label: 'Nursing Care' },
  { value: 'other', label: 'Other' },
];

export default function ProviderFilters({ filters, onFiltersChange, onClose }: ProviderFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onFiltersChange({ ...filters, minRating: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Any</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.8">4.8+ Stars</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price (KWD)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => onFiltersChange({ ...filters, availableNow: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available Now</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.emergencyAvailable}
              onChange={(e) => onFiltersChange({ ...filters, emergencyAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Emergency Available</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end">
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
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

