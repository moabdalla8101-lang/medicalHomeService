'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfileEdit() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setName(data.profile.name || '');
      } else {
        toast.error('فشل تحميل البيانات', {
          style: {
            direction: 'rtl',
            textAlign: 'right',
          },
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('يرجى إدخال الاسم', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حفظ البيانات');
      }

      setProfile(data.profile);
      toast.success('تم حفظ البيانات بنجاح', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'فشل حفظ البيانات', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 flex-row-reverse">
          <User className="w-6 h-6" />
          المعلومات الشخصية
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              رقم الهاتف
            </label>
            <input
              type="text"
              value={profile?.phone || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الاسم *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 flex-row-reverse"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 flex-row-reverse">
          <MapPin className="w-6 h-6" />
          العناوين المستخدمة
        </h3>

        {profile?.addresses && profile.addresses.length > 0 ? (
          <div className="space-y-3">
            {profile.addresses.map((address: string, index: number) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-right"
              >
                <p className="text-gray-700">{address}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-right">لا توجد عناوين مسجلة بعد</p>
        )}
        <p className="text-sm text-gray-500 mt-4 text-right">
          العناوين المعروضة هي العناوين التي استخدمتها في الحجوزات السابقة
        </p>
      </div>
    </div>
  );
}

