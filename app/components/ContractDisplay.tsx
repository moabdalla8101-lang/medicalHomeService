import { EnergyContract } from '@/lib/types';

interface ContractDisplayProps {
  contract: EnergyContract;
}

export default function ContractDisplay({ contract }: ContractDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-6 md:p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Your Current Contract</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contract.provider && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Provider</p>
            <p className="text-lg font-bold text-gray-900">{contract.provider}</p>
          </div>
        )}
        {contract.tariffName && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tariff</p>
            <p className="text-lg font-bold text-gray-900">{contract.tariffName}</p>
          </div>
        )}
        {contract.pricePerKwh !== null && contract.pricePerKwh !== undefined && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price per kWh</p>
            <p className="text-lg font-bold text-blue-600">£{contract.pricePerKwh.toFixed(4)}</p>
          </div>
        )}
        {contract.standingCharge !== null && contract.standingCharge !== undefined && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Standing Charge (daily)</p>
            <p className="text-lg font-bold text-gray-900">£{contract.standingCharge.toFixed(2)}</p>
          </div>
        )}
        {contract.annualConsumption && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Annual Consumption</p>
            <p className="text-lg font-bold text-gray-900">{contract.annualConsumption.toLocaleString()} kWh</p>
          </div>
        )}
        {contract.contractLength && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contract Length</p>
            <p className="text-lg font-bold text-gray-900">{contract.contractLength} months</p>
          </div>
        )}
      </div>
    </div>
  );
}

