'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminProviderApprovalProps {
  onUpdate: () => void;
}

export default function AdminProviderApproval({ onUpdate }: AdminProviderApprovalProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/providers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/providers/${providerId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Provider approved');
        fetchProviders();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to approve provider');
      }
    } catch (error) {
      toast.error('Failed to approve provider');
    }
  };

  const handleReject = async (providerId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/providers/${providerId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success('Provider rejected');
        fetchProviders();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject provider');
      }
    } catch (error) {
      toast.error('Failed to reject provider');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pending providers</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <p className="text-gray-600">{provider.specialty}</p>
              {provider.bio && (
                <p className="text-sm text-gray-500 mt-2">{provider.bio}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProvider(provider)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => handleApprove(provider.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason:');
                  if (reason) {
                    handleReject(provider.id, reason);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>

          {/* Documents */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
            <div className="flex gap-2">
              {provider.civilId && (
                <a
                  href={provider.civilId}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Civil ID
                </a>
              )}
              {provider.medicalLicense && (
                <a
                  href={provider.medicalLicense}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Medical License
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Provider Details</h2>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Name</p>
                <p>{selectedProvider.name}</p>
              </div>
              <div>
                <p className="font-semibold">Specialty</p>
                <p>{selectedProvider.specialty}</p>
              </div>
              {selectedProvider.bio && (
                <div>
                  <p className="font-semibold">Bio</p>
                  <p>{selectedProvider.bio}</p>
                </div>
              )}
              {selectedProvider.experience && (
                <div>
                  <p className="font-semibold">Experience</p>
                  <p>{selectedProvider.experience} years</p>
                </div>
              )}
              {selectedProvider.iban && (
                <div>
                  <p className="font-semibold">IBAN</p>
                  <p>{selectedProvider.iban}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

