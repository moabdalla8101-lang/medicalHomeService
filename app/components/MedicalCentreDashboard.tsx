'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, Settings, LogOut, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MedicalCentreProviders from './MedicalCentreProviders';
import MedicalCentreBookings from './MedicalCentreBookings';
import MedicalCentreAvailability from './MedicalCentreAvailability';
import MedicalCentreAnalytics from './MedicalCentreAnalytics';

interface MedicalCentreDashboardProps {
  user: any;
}

export default function MedicalCentreDashboard({ user }: MedicalCentreDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'bookings' | 'availability' | 'analytics'>('overview');
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalBookings: 0,
    todayBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medical-centre/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.overview);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.medicalCentre?.name || 'Medical Centre Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user.medicalCentre?.address || 'Manage your medical centre'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Providers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProviders}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayBookings}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingBookings}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.monthlyRevenue.toFixed(0)} KWD</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'providers', label: 'Providers', icon: Users },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'availability', label: 'Availability', icon: Clock },
                { id: 'analytics', label: 'Analytics', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-semibold">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-semibold text-green-600">{stats.completedBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">{stats.totalRevenue.toFixed(2)} KWD</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Medical Centre Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> {user.medicalCentre?.name || 'N/A'}</p>
                    <p><span className="text-gray-600">Address:</span> {user.medicalCentre?.address || 'N/A'}</p>
                    <p><span className="text-gray-600">Phone:</span> {user.medicalCentre?.phone || 'N/A'}</p>
                    <p><span className="text-gray-600">Email:</span> {user.medicalCentre?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <MedicalCentreProviders onUpdate={fetchDashboardData} />
          )}

          {activeTab === 'bookings' && (
            <MedicalCentreBookings />
          )}

          {activeTab === 'availability' && (
            <MedicalCentreAvailability />
          )}

          {activeTab === 'analytics' && (
            <MedicalCentreAnalytics />
          )}
        </div>
      </div>
    </div>
  );
}

