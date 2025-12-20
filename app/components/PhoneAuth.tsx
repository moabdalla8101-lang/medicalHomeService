'use client';

import React, { useState } from 'react';
import { Phone, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhoneAuthProps {
  onSuccess?: (token: string, user: any) => void;
  onAuthSuccess?: (token: string, user: any) => void;
  role?: 'user' | 'provider' | 'admin' | 'medical_centre';
}

export default function PhoneAuth({ onSuccess, onAuthSuccess, role = 'user' }: PhoneAuthProps) {
  const handleSuccess = onAuthSuccess || onSuccess;
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      toast.error('أدخل رقم هاتفك', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Store normalized phone for verification (always available from API)
      setNormalizedPhone(data.normalizedPhone || phone);
      
      // Show OTP in toast (mock SMS system - for testing)
      if (data.otp) {
        console.log('OTP:', data.otp);
        console.log('Normalized phone:', data.normalizedPhone || phone);
        // Show OTP toast with longer duration, then show success message
        toast.success(`رمز التحقق الخاص بك: ${data.otp}`, { 
          duration: 20000,
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            direction: 'rtl',
            textAlign: 'right',
          }
        });
        // Also show a brief success message
        setTimeout(() => {
          toast.success('تم إرسال رمز التحقق', { 
            duration: 3000,
            style: {
              direction: 'rtl',
              textAlign: 'right',
            }
          });
        }, 500);
      } else {
        toast.success('تم إرسال رمز التحقق', { 
          duration: 3000,
          style: {
            direction: 'rtl',
            textAlign: 'right',
          }
        });
      }
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال رمز التحقق', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Clean and validate OTP
    const cleanOtp = otp.trim().replace(/\D/g, ''); // Remove non-digits
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error('أدخل رمز التحقق الصحيح', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
      return;
    }

    setLoading(true);
    try {
      // Always use normalized phone for verification to ensure consistency
      const phoneToVerify = normalizedPhone || phone;
      
      if (!phoneToVerify) {
        toast.error('رقم الهاتف مفقود. يرجى البدء من جديد.', {
          style: {
            direction: 'rtl',
            textAlign: 'right',
          }
        });
        return;
      }
      
      console.log('Verifying with:', { phoneToVerify, otp: cleanOtp, originalPhone: phone, normalizedPhone });
      
      // SECURITY: Role parameter removed - users cannot specify their own role
      const requestBody = { 
        phone: phoneToVerify, 
        otp: cleanOtp // Use cleaned OTP
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'رمز التحقق غير صحيح');
      }

      toast.success('تم تسجيل الدخول بنجاح', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
      if (handleSuccess) {
        handleSuccess(data.token, data.user);
      }
    } catch (error: any) {
      toast.error(error.message || 'رمز التحقق غير صحيح', {
        style: {
          direction: 'rtl',
          textAlign: 'right',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-right" dir="rtl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'أدخل رقم هاتفك' : 'أدخل رمز التحقق'}
        </h2>
        <p className="text-gray-600">
          {step === 'phone'
            ? "سنرسل لك رمز التحقق"
            : 'أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك'}
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              رقم الهاتف (الكويت)
            </label>
            <div className="flex" dir="rtl">
              <span className="inline-flex items-center px-3 rounded-r-lg border-l-0 border-r border border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                +965
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="XXXXXXXX"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-left"
                maxLength={8}
                dir="ltr"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 text-right">
              أدخل رقم هاتفك الكويتي المكون من 8 أرقام
            </p>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || phone.length !== 8}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 flex-row-reverse"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال رمز التحقق'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              رمز التحقق
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 flex-row-reverse"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                تحقق & تسجيل الدخول
              </>
            )}
          </button>

          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
            }}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 text-right"
          >
            تغيير رقم الهاتف
          </button>
        </div>
      )}
    </div>
  );
}

