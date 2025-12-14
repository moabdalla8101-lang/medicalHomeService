'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProviderFeed from '../components/ProviderFeed';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const t = useTranslations();

  useEffect(() => {
    // Check if user is already logged in (optional - for role-based routing)
    // Only redirect if they're on the home page and have provider/admin role
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
        
        // Only auto-redirect if user explicitly navigated here (not from provider/admin page)
        // Check if we're coming from a provider/admin page redirect
        const fromProvider = sessionStorage.getItem('fromProviderRedirect');
        const fromAdmin = sessionStorage.getItem('fromAdminRedirect');
        if (fromProvider || fromAdmin) {
          sessionStorage.removeItem('fromProviderRedirect');
          sessionStorage.removeItem('fromAdminRedirect');
          return; // Don't redirect back, let them stay on home
        }
        
        // Route based on role (only if they're provider or admin)
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

  // Allow browsing without authentication
  return <ProviderFeed />;
}

