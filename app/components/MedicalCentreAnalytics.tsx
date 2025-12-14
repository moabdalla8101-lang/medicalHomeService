'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';

export default function MedicalCentreAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medical-centre/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{analytics.summary.totalBookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{analytics.summary.completedBookings}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{analytics.summary.totalRevenue.toFixed(0)} KWD</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Booking</p>
              <p className="text-2xl font-bold">{analytics.summary.averageBookingValue.toFixed(0)} KWD</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Provider Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.providerPerformance.map((provider: any) => (
                <tr key={provider.id}>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.specialty}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{provider.completedBookings}</td>
                  <td className="px-4 py-4 font-semibold">{provider.revenue.toFixed(0)} KWD</td>
                  <td className="px-4 py-4">{provider.averageBookingValue.toFixed(0)} KWD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Service Category Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(analytics.serviceBreakdown).map(([category, data]: [string, any]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium capitalize">{category.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600">{data.count} bookings</div>
              </div>
              <div className="font-semibold">{data.revenue.toFixed(0)} KWD</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

