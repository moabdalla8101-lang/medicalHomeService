'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function AdminFinancials() {
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/financials', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFinancials(data.financials);
      }
    } catch (error) {
      console.error('Error fetching financials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!financials) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No financial data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{financials.totalRevenue.toFixed(2)} KWD</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Commission</p>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{financials.totalCommission.toFixed(2)} KWD</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">This Month</p>
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{financials.thisMonth.toFixed(2)} KWD</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Standard Bookings</span>
            <span className="font-semibold">{financials.standardBookings || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Emergency Bookings</span>
            <span className="font-semibold">{financials.emergencyBookings || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average Commission Rate</span>
            <span className="font-semibold">{financials.commissionPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

