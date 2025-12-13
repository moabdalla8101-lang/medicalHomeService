'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download } from 'lucide-react';

export default function ProviderEarnings() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/provider/earnings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data.earnings);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!earnings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No earnings data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{earnings.total.toFixed(2)} KWD</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">This Month</p>
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{earnings.thisMonth.toFixed(2)} KWD</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending Payout</p>
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{earnings.pending.toFixed(2)} KWD</p>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Commission Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Commission</span>
            <span className="font-semibold">{earnings.commissionPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Commission Paid</span>
            <span className="font-semibold">{earnings.totalCommission.toFixed(2)} KWD</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {earnings.recent && earnings.recent.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
              <Download className="w-4 h-4" />
              Download Statement
            </button>
          </div>
          <div className="space-y-3">
            {earnings.recent.map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p className="font-semibold text-green-600">+{transaction.amount.toFixed(2)} KWD</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

