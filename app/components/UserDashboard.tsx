'use client';

import { useState } from 'react';
import { User, Calendar, History, LogOut, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserProfileEdit from './UserProfileEdit';
import UserBookings from './UserBookings';

interface UserDashboardProps {
  user: any;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'current' | 'history'>('profile');

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-row-reverse"
              >
                <Home className="w-5 h-5" />
                الصفحة الرئيسية
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors flex-row-reverse"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 flex-row-reverse ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              الملف الشخصي
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 flex-row-reverse ${
                activeTab === 'current'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              الحجوزات الحالية
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 flex-row-reverse ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              سجل الحجوزات
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && <UserProfileEdit />}
        {activeTab === 'current' && <UserBookings showHistory={false} />}
        {activeTab === 'history' && <UserBookings showHistory={true} />}
      </div>
    </div>
  );
}

