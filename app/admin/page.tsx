'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneAuth from '../components/PhoneAuth';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
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
        if (data.user.role !== 'admin') {
          // Clear the token if user has wrong role, so they can login as admin
          localStorage.removeItem('token');
          // Set flag to prevent home page from redirecting back
          sessionStorage.setItem('fromAdminRedirect', 'true');
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

  const handleAuthSuccess = async (token: string, userData: any) => {
    // SECURITY: Role can no longer be changed during authentication
    // Users must have admin role assigned through database/admin operations
    if (userData.role !== 'admin') {
      alert('Access denied. Admin role required. Please contact an administrator to grant admin access.');
      localStorage.removeItem('token');
      return;
    }
    
    // User is already admin, proceed normally
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-4">
            <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
            <p className="text-gray-600 text-center mb-6">
              Enter your phone number to access the admin dashboard
            </p>
            <PhoneAuth onSuccess={handleAuthSuccess} role="admin" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">Security Note:</p>
            <p>Only users with admin role can access this page. Admin role must be assigned through database or admin operations.</p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} />;
}

