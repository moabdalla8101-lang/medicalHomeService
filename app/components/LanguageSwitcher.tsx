'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    // Get current pathname
    let currentPath = pathname;
    
    // Remove current locale prefix if it exists
    if (currentPath.startsWith(`/${locale}`)) {
      currentPath = currentPath.replace(`/${locale}`, '') || '/';
    }
    
    // If path is just '/', keep it as '/'
    if (currentPath === '/') {
      currentPath = '';
    }
    
    // Build new path with new locale
    const newPath = `/${newLocale}${currentPath}`;
    
    // Force a full page reload to ensure RTL/LTR changes take effect
    window.location.href = newPath;
  };

  const isRTL = locale === 'ar';

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        aria-label="Switch language"
      >
        <Globe className="w-5 h-5" />
        <span className="font-medium">{locale === 'ar' ? 'العربية' : 'English'}</span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[120px] ${isRTL ? 'left-0' : 'right-0'}`}>
            <button
              onClick={() => switchLocale('ar')}
              className={`w-full px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                locale === 'ar' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
            >
              العربية
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`w-full px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                locale === 'en' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}

