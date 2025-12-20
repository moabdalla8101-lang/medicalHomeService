'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneAuth from '../components/PhoneAuth';
import UserDashboard from '../components/UserDashboard';

export default function UserPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
        if (data.user.role !== 'user') {
          // Clear the token if user has wrong role
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    if (userData.role !== 'user') {
      router.push('/');
      return;
    }
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <PhoneAuth onSuccess={handleAuthSuccess} role="user" />
      </div>
    );
  }

  return <UserDashboard user={user} />;
}

