'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneAuth from '@/app/components/PhoneAuth';
import MedicalCentreDashboard from '../components/MedicalCentreDashboard';

export default function MedicalCentrePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        const userData = data.user;
        
        // Check if user is a medical centre admin
        if (userData.role === 'medical_centre' && userData.medicalCentreId) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Clear token if user is not a medical centre admin
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Medical Centre Login
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in to manage your medical centre
          </p>
          <PhoneAuth 
            role="medical_centre"
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    );
  }

  return <MedicalCentreDashboard user={user} />;
}

