'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ProviderProfile from '@/app/components/ProviderProfile';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProviderPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch provider');
        }

        setProvider(data.provider);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProvider();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Provider not found'}</p>
          <a href={`/${locale}`} className="text-blue-600 hover:underline">
            {t('provider.backToHome')}
          </a>
        </div>
      </div>
    );
  }

  return <ProviderProfile provider={provider} />;
}

