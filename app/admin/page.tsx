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
    // After login, check if user needs admin role assigned
    // In development, we can auto-assign admin role
    if (userData.role !== 'admin') {
      try {
        // Try to update role to admin (for development/testing)
        const response = await fetch('/api/auth/update-role', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'admin' }),
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update token with new role
          localStorage.setItem('token', data.token);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Can't update role, show error
          const errorData = await response.json();
          alert(errorData.error || 'This account does not have admin access. Please use an admin account.');
          localStorage.removeItem('token');
          return;
        }
      } catch (error) {
        alert('Failed to grant admin access. Please try again.');
        localStorage.removeItem('token');
        return;
      }
      return;
    }
    
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
            <PhoneAuth onSuccess={handleAuthSuccess} role="user" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Development Note:</p>
            <p>After login, your account will be automatically granted admin access for testing purposes.</p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} />;
}

