'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname if present
    const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/';
    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[120px]">
            <button
              onClick={() => switchLocale('ar')}
              className={`w-full text-right px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                locale === 'ar' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                locale === 'en' ? 'bg-blue-50 text-blue-600 font-semibold' : ''
              }`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}

