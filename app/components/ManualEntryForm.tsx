'use client';

import { useState } from 'react';
import { EnergyContract } from '@/lib/types';

interface ManualEntryFormProps {
  onSubmit: (contract: EnergyContract) => void;
  isProcessing: boolean;
}

export default function ManualEntryForm({ onSubmit, isProcessing }: ManualEntryFormProps) {
  const [formData, setFormData] = useState({
    provider: '',
    tariffName: '',
    pricePerKwh: '',
    standingCharge: '',
    contractLength: '',
    annualConsumption: '',
    postcode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'German postal code is required (5 digits)';
    } else if (!/^\d{5}$/.test(formData.postcode.trim())) {
      newErrors.postcode = 'Postal code must be 5 digits (e.g., 10115)';
    }

    if (!formData.annualConsumption.trim()) {
      newErrors.annualConsumption = 'Annual consumption is required';
    } else if (isNaN(Number(formData.annualConsumption)) || Number(formData.annualConsumption) <= 0) {
      newErrors.annualConsumption = 'Please enter a valid number';
    }

    if (formData.pricePerKwh && (isNaN(Number(formData.pricePerKwh)) || Number(formData.pricePerKwh) <= 0)) {
      newErrors.pricePerKwh = 'Please enter a valid price (e.g., 0.30)';
    }

    if (formData.standingCharge && (isNaN(Number(formData.standingCharge)) || Number(formData.standingCharge) <= 0)) {
      newErrors.standingCharge = 'Please enter a valid standing charge';
    }

    if (formData.contractLength && (isNaN(Number(formData.contractLength)) || Number(formData.contractLength) <= 0)) {
      newErrors.contractLength = 'Please enter a valid contract length in months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const contract: EnergyContract = {
      provider: formData.provider || undefined,
      tariffName: formData.tariffName || undefined,
      pricePerKwh: formData.pricePerKwh ? parseFloat(formData.pricePerKwh) : undefined,
      standingCharge: formData.standingCharge ? parseFloat(formData.standingCharge) : undefined,
      contractLength: formData.contractLength ? parseInt(formData.contractLength) : undefined,
      annualConsumption: parseInt(formData.annualConsumption),
      rawText: `Postal Code: ${formData.postcode}. Annual Consumption: ${formData.annualConsumption} kWh.${formData.provider ? ` Provider: ${formData.provider}.` : ''}${formData.tariffName ? ` Tariff: ${formData.tariffName}.` : ''}${formData.pricePerKwh ? ` Price per kWh: ${formData.pricePerKwh}€.` : ''}${formData.standingCharge ? ` Standing Charge: ${formData.standingCharge}€/month.` : ''}`,
    };

    onSubmit(contract);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Fields */}
        <div className="md:col-span-2">
          <label htmlFor="postcode" className="block text-sm font-semibold text-gray-700 mb-2">
            German Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="postcode"
            value={formData.postcode}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              handleChange('postcode', value);
            }}
            placeholder="e.g., 10115"
            maxLength={5}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.postcode ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.postcode && (
            <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">5-digit German postal code (required for comparison)</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="annualConsumption" className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Consumption (kWh) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="annualConsumption"
            value={formData.annualConsumption}
            onChange={(e) => handleChange('annualConsumption', e.target.value)}
            placeholder="e.g., 3000"
            min="0"
            step="100"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.annualConsumption ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.annualConsumption && (
            <p className="mt-1 text-sm text-red-600">{errors.annualConsumption}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Your annual electricity consumption in kilowatt-hours</p>
        </div>

        {/* Optional Fields */}
        <div>
          <label htmlFor="provider" className="block text-sm font-semibold text-gray-700 mb-2">
            Current Provider
          </label>
          <input
            type="text"
            id="provider"
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            placeholder="e.g., Vattenfall"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="tariffName" className="block text-sm font-semibold text-gray-700 mb-2">
            Tariff Name
          </label>
          <input
            type="text"
            id="tariffName"
            value={formData.tariffName}
            onChange={(e) => handleChange('tariffName', e.target.value)}
            placeholder="e.g., ÖkoStrom12"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="pricePerKwh" className="block text-sm font-semibold text-gray-700 mb-2">
            Price per kWh (€)
          </label>
          <input
            type="number"
            id="pricePerKwh"
            value={formData.pricePerKwh}
            onChange={(e) => handleChange('pricePerKwh', e.target.value)}
            placeholder="e.g., 0.30"
            min="0"
            step="0.001"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.pricePerKwh ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.pricePerKwh && (
            <p className="mt-1 text-sm text-red-600">{errors.pricePerKwh}</p>
          )}
        </div>

        <div>
          <label htmlFor="standingCharge" className="block text-sm font-semibold text-gray-700 mb-2">
            Standing Charge (€/month)
          </label>
          <input
            type="number"
            id="standingCharge"
            value={formData.standingCharge}
            onChange={(e) => handleChange('standingCharge', e.target.value)}
            placeholder="e.g., 11.90"
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.standingCharge ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.standingCharge && (
            <p className="mt-1 text-sm text-red-600">{errors.standingCharge}</p>
          )}
        </div>

        <div>
          <label htmlFor="contractLength" className="block text-sm font-semibold text-gray-700 mb-2">
            Contract Length (months)
          </label>
          <input
            type="number"
            id="contractLength"
            value={formData.contractLength}
            onChange={(e) => handleChange('contractLength', e.target.value)}
            placeholder="e.g., 12"
            min="1"
            step="1"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.contractLength ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.contractLength && (
            <p className="mt-1 text-sm text-red-600">{errors.contractLength}</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? 'Finding Deals...' : 'Find Better Deals'}
        </button>
        <p className="mt-3 text-xs text-gray-500 text-center">
          * Required fields. Optional fields help us calculate your potential savings more accurately.
        </p>
      </div>
    </form>
  );
}

