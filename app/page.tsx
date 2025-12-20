'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogIn, UserPlus } from 'lucide-react';
import ProviderFeed from './components/ProviderFeed';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        const fromProvider = sessionStorage.getItem('fromProviderRedirect');
        const fromAdmin = sessionStorage.getItem('fromAdminRedirect');
        if (fromProvider || fromAdmin) {
          sessionStorage.removeItem('fromProviderRedirect');
          sessionStorage.removeItem('fromAdminRedirect');
          setLoading(false);
          return;
        }
        
        if (data.user.role === 'provider') {
          router.push('/provider');
          return;
        } else if (data.user.role === 'admin') {
          router.push('/admin');
          return;
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/user');
  };

  const handleRegister = () => {
    router.push('/user');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">خدمات الرعاية الطبية المنزلية</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : user && user.role === 'user' ? (
                <>
                  <span className="text-gray-700 text-sm">{user.name || user.phone}</span>
                  <button
                    onClick={() => router.push('/user')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-row-reverse"
                  >
                    <User className="w-5 h-5" />
                    حسابي
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex-row-reverse"
                  >
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-row-reverse"
                  >
                    <UserPlus className="w-5 h-5" />
                    إنشاء حساب
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProviderFeed />
    </div>
  );
}



