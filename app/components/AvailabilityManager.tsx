'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvailabilityManagerProps {
  providerId: string;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export default function AvailabilityManager({ providerId }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [addingSlot, setAddingSlot] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/provider/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setAddingSlot(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/provider/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime,
          endTime,
        }),
      });

      if (response.ok) {
        toast.success('Slot added successfully');
        setShowAddModal(false);
        setSelectedDate('');
        fetchSlots();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add slot');
      }
    } catch (error) {
      toast.error('Failed to add slot');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleToggleAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/provider/availability', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId,
          isAvailable: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success('Slot updated successfully');
        fetchSlots();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update slot');
      }
    } catch (error) {
      toast.error('Failed to update slot');
    }
  };

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      toast.error('Cannot delete a booked slot');
      return;
    }

    if (!confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/provider/availability?slotId=${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Slot deleted successfully');
        fetchSlots();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete slot');
      }
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Get next 14 days for date picker
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  if (loading) {
    return <div className="text-center py-8">Loading availability...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Slot Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Availability Slots</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {/* Slots by Date */}
      {Object.keys(slotsByDate).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No availability slots added yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Slot" to create your first availability</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots]) => (
              <div key={date} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {dateSlots.filter(s => s.isAvailable && !s.isBooked).length} available
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {dateSlots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border-2 ${
                          slot.isBooked
                            ? 'border-red-300 bg-red-50'
                            : slot.isAvailable
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <Clock className="w-3 h-3" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                          {slot.isBooked && (
                            <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded">
                              Booked
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                            disabled={slot.isBooked}
                            className={`flex-1 text-xs py-1 px-2 rounded ${
                              slot.isAvailable
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {slot.isAvailable ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id, slot.isBooked)}
                            disabled={slot.isBooked}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={slot.isBooked ? 'Cannot delete booked slot' : 'Delete slot'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Availability Slot</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  disabled={addingSlot || !selectedDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {addingSlot ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

