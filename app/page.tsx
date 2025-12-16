'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProviderFeed from './components/ProviderFeed';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
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
          return;
        }
        
        if (data.user.role === 'provider') {
          router.push('/provider');
        } else if (data.user.role === 'admin') {
          router.push('/admin');
        }
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  return <ProviderFeed />;
}


