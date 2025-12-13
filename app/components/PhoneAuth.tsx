'use client';

import React, { useState } from 'react';
import { Phone, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhoneAuthProps {
  onSuccess: (token: string, user: any) => void;
  role?: 'user' | 'provider' | 'admin';
}

export default function PhoneAuth({ onSuccess, role = 'user' }: PhoneAuthProps) {
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
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

      toast.success('OTP sent successfully!');
      setStep('otp');
      // Store normalized phone for verification (always available from API)
      setNormalizedPhone(data.normalizedPhone || phone);
      
      // Show OTP in toast (mock SMS system - for testing)
      if (data.otp) {
        console.log('OTP:', data.otp);
        console.log('Normalized phone:', data.normalizedPhone || phone);
        toast.success(`Your OTP: ${data.otp}`, { duration: 15000 });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Clean and validate OTP
    const cleanOtp = otp.trim().replace(/\D/g, ''); // Remove non-digits
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Always use normalized phone for verification to ensure consistency
      const phoneToVerify = normalizedPhone || phone;
      
      if (!phoneToVerify) {
        toast.error('Phone number is missing. Please start over.');
        return;
      }
      
      console.log('Verifying with:', { phoneToVerify, otp: cleanOtp, originalPhone: phone, normalizedPhone, role });
      
      const requestBody = { 
        phone: phoneToVerify, 
        otp: cleanOtp, // Use cleaned OTP
        ...(role && { role }) // Only include role if it exists
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
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success('Login successful!');
      onSuccess(data.token, data.user);
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'Enter Your Phone' : 'Verify OTP'}
        </h2>
        <p className="text-gray-600">
          {step === 'phone'
            ? "We'll send you a verification code"
            : 'Enter the 6-digit code sent to your phone'}
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Kuwait)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +965
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="XXXXXXXX"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                maxLength={8}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter your 8-digit Kuwait phone number
            </p>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || phone.length !== 8}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify & Login
              </>
            )}
          </button>

          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
            }}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
          >
            Change phone number
          </button>
        </div>
      )}
    </div>
  );
}

