'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicalCentreAvailability() {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchAvailability();
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medical-centre/providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedProvider(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medical-centre/availability?providerId=${selectedProvider}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setAvailability(data.data[0].availability || []);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const generateWeeklySlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate hourly slots from 9 AM to 6 PM
      for (let hour = 9; hour < 18; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        slots.push({
          date: dateStr,
          startTime,
          endTime,
          isAvailable: true,
        });
      }
    }
    
    return slots;
  };

  const handleSave = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medical-centre/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: selectedProvider,
          availability: availability,
        }),
      });

      if (response.ok) {
        toast.success('Availability updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Manage Availability</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select Provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} - {provider.specialty}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAvailability(generateWeeklySlots())}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Generate Weekly Slots
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {selectedProvider && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-4">
            {availability.length} availability slots configured
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {availability.map((slot, index) => (
              <div key={index} className="bg-white rounded p-2 text-sm">
                <div className="font-medium">{slot.date}</div>
                <div className="text-gray-600">{slot.startTime} - {slot.endTime}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

