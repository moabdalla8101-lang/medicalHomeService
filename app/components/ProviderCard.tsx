'use client';

import { Star, MapPin, Clock, AlertCircle } from 'lucide-react';
import { ProviderProfile } from '@/lib/types';

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    specialty: string;
    profilePhoto?: string;
    rating: number;
    totalReviews: number;
    emergencyAvailable: boolean;
    services: Array<{ price: number }>;
  };
  onClick: () => void;
}

export default function ProviderCard({ provider, onClick }: ProviderCardProps) {
  const minPrice = Math.min(...provider.services.map(s => s.price));
  const maxPrice = Math.max(...provider.services.map(s => s.price));
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
      dir="rtl"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {provider.profilePhoto ? (
          <img
            src={provider.profilePhoto}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-600">
            {provider.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Emergency Badge */}
        {provider.emergencyAvailable && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-row-reverse">
            <AlertCircle className="w-3 h-3" />
            طوارئ
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          متاح
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
          {provider.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{provider.specialty}</p>
        
        {/* Medical Centre */}
        {(provider as any).medicalCentre && (
          <p className="text-xs text-gray-500 mb-2 text-right">
            {(provider as any).medicalCentre.name}
          </p>
        )}
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 flex-row-reverse">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900">
            {provider.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({provider.totalReviews} تقييمات)
          </span>
        </div>
        
        {/* Price Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-row-reverse">
          <span className="font-semibold text-blue-600">
            {minPrice === maxPrice 
              ? `${minPrice} د.ك`
              : `${minPrice} - ${maxPrice} د.ك`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
