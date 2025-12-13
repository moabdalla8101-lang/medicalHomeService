'use client';

import { useState, useEffect } from 'react';
// EnergyContract type is not part of the medical services app
// This component is for contract analysis features
interface EnergyContract {
  [key: string]: any;
}

interface ReviewContractProps {
  contract: EnergyContract;
  onConfirm: (contract: EnergyContract) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function ReviewContract({ contract, onConfirm, onCancel, isProcessing }: ReviewContractProps) {
  const [editedContract, setEditedContract] = useState<EnergyContract>(contract);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditedContract(contract);
  }, [contract]);

  const handleChange = (field: keyof EnergyContract, value: string | number | undefined) => {
    setEditedContract(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    
    // Clear error when user starts editing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Extract postal code from rawText or check if it exists
    const postcodeMatch = editedContract.rawText?.match(/\b\d{5}\b/);
    if (!postcodeMatch) {
      newErrors.postcode = 'German postal code (5 digits) is required for comparison';
    }

    if (!editedContract.annualConsumption || editedContract.annualConsumption <= 0) {
      newErrors.annualConsumption = 'Annual consumption is required and must be greater than 0';
    }

    if (editedContract.pricePerKwh !== undefined && editedContract.pricePerKwh !== null && editedContract.pricePerKwh < 0) {
      newErrors.pricePerKwh = 'Price per kWh must be a positive number';
    }

    if (editedContract.standingCharge !== undefined && editedContract.standingCharge !== null && editedContract.standingCharge < 0) {
      newErrors.standingCharge = 'Standing charge must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Ensure rawText contains postal code for Check24 extraction
    const postcodeMatch = editedContract.rawText?.match(/\b\d{5}\b/);
    if (!postcodeMatch && editedContract.rawText) {
      // Try to extract from other fields or prompt user
      const updatedRawText = editedContract.rawText + ' Postal Code: [MISSING - Please add in rawText]';
      editedContract.rawText = updatedRawText;
    }

    onConfirm(editedContract);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-blue-800 font-semibold mb-1">Review Extracted Data</h3>
            <p className="text-blue-700 text-sm">
              Please review the extracted contract information. You can edit any field before proceeding to comparison.
              <strong className="block mt-1">Postal code and annual consumption are required for comparison.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider */}
        <div>
          <label htmlFor="provider" className="block text-sm font-semibold text-gray-700 mb-2">
            Provider
          </label>
          <input
            type="text"
            id="provider"
            value={editedContract.provider || ''}
            onChange={(e) => handleChange('provider', e.target.value)}
            placeholder="e.g., Vattenfall"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>

        {/* Tariff Name */}
        <div>
          <label htmlFor="tariffName" className="block text-sm font-semibold text-gray-700 mb-2">
            Tariff Name
          </label>
          <input
            type="text"
            id="tariffName"
            value={editedContract.tariffName || ''}
            onChange={(e) => handleChange('tariffName', e.target.value)}
            placeholder="e.g., ÖkoStrom12"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>

        {/* Price per kWh */}
        <div>
          <label htmlFor="pricePerKwh" className="block text-sm font-semibold text-gray-700 mb-2">
            Price per kWh (€) <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            id="pricePerKwh"
            value={editedContract.pricePerKwh || ''}
            onChange={(e) => handleChange('pricePerKwh', e.target.value ? parseFloat(e.target.value) : undefined)}
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

        {/* Standing Charge */}
        <div>
          <label htmlFor="standingCharge" className="block text-sm font-semibold text-gray-700 mb-2">
            Standing Charge (€/day) <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            id="standingCharge"
            value={editedContract.standingCharge || ''}
            onChange={(e) => handleChange('standingCharge', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g., 0.40"
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

        {/* Annual Consumption - REQUIRED */}
        <div>
          <label htmlFor="annualConsumption" className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Consumption (kWh) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="annualConsumption"
            value={editedContract.annualConsumption || ''}
            onChange={(e) => handleChange('annualConsumption', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 3000"
            min="0"
            step="100"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.annualConsumption ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
            required
          />
          {errors.annualConsumption && (
            <p className="mt-1 text-sm text-red-600">{errors.annualConsumption}</p>
          )}
        </div>

        {/* Contract Length */}
        <div>
          <label htmlFor="contractLength" className="block text-sm font-semibold text-gray-700 mb-2">
            Contract Length (months) <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            id="contractLength"
            value={editedContract.contractLength || ''}
            onChange={(e) => handleChange('contractLength', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 12"
            min="1"
            step="1"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>

        {/* Postal Code - Check in rawText */}
        <div className="md:col-span-2">
          <label htmlFor="postcode" className="block text-sm font-semibold text-gray-700 mb-2">
            German Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="postcode"
            value={editedContract.rawText?.match(/\b\d{5}\b/)?.[0] || ''}
            onChange={(e) => {
              const postcode = e.target.value.replace(/\D/g, '').slice(0, 5);
              const updatedRawText = editedContract.rawText?.replace(/\b\d{5}\b/, postcode) || `Postal Code: ${postcode}`;
              if (!updatedRawText.includes('Postal Code:')) {
                handleChange('rawText', `Postal Code: ${postcode}. ${editedContract.rawText || ''}`);
              } else {
                handleChange('rawText', updatedRawText);
              }
            }}
            placeholder="e.g., 10115"
            maxLength={5}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.postcode ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isProcessing}
            required
          />
          {errors.postcode && (
            <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">5-digit German postal code (required for comparison)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? 'Processing...' : 'Confirm & Find Deals'}
        </button>
      </div>
    </div>
  );
}

