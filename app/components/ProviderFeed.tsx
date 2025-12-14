'use client';

import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import ProviderCard from './ProviderCard';
import ProviderFilters from './ProviderFilters';
import LanguageSwitcher from './LanguageSwitcher';
import { useRouter } from 'next/navigation';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  profilePhoto?: string;
  rating: number;
  totalReviews: number;
  emergencyAvailable: boolean;
  services: Array<{ price: number }>;
}

export default function ProviderFeed() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    serviceType: '',
    minRating: '',
    maxPrice: '',
    availableNow: false,
    emergencyAvailable: false,
  });

  const fetchProviders = async (pageNum = 1, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.availableNow) params.append('availableNow', 'true');
      if (filters.emergencyAvailable) params.append('emergencyAvailable', 'true');

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setProviders(data.data);
        } else {
          setProviders(prev => [...prev, ...data.data]);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(1, true);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProviders(page + 1, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              {t('home.filterBy')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ProviderFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && providers.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('home.noProviders')}</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={providers.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            }
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onClick={() => router.push(`/${locale}/providers/${provider.id}`)}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}

