import { ComparisonResult } from '@/lib/types';

interface ComparisonResultsProps {
  results: ComparisonResult;
}

export default function ComparisonResults({ results }: ComparisonResultsProps) {
  if (!results.recommendedDeal) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-yellow-800 font-semibold text-lg">No better deals found at this time.</p>
        <p className="text-yellow-700 text-sm mt-2">Your current contract appears to be competitive.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {results.totalSavings && results.totalSavings > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-8 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-green-800 mb-1">
                You could save £{results.totalSavings.toFixed(2)} per year!
              </h3>
              <p className="text-green-700 font-medium">Based on your current contract details</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Recommended Deal</h3>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 mb-8 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Provider</p>
              <p className="text-xl font-bold text-gray-900">{results.recommendedDeal.provider}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tariff</p>
              <p className="text-xl font-bold text-gray-900">{results.recommendedDeal.tariffName}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price per kWh</p>
              <p className="text-xl font-bold text-blue-600">£{results.recommendedDeal.pricePerKwh.toFixed(4)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Annual Cost</p>
              <p className="text-xl font-bold text-gray-900">£{results.recommendedDeal.estimatedAnnualCost.toFixed(2)}</p>
            </div>
            {results.recommendedDeal.savings && (
              <div className="md:col-span-2 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-300">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Potential Savings</p>
                <p className="text-4xl font-bold text-green-700">
                  £{results.recommendedDeal.savings.toFixed(2)}/year
                </p>
              </div>
            )}
          </div>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Switch to This Deal
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">All Available Deals</h3>
          <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            {results.deals.length} deals found
          </span>
        </div>
        <div className="space-y-4">
          {results.deals.map((deal, index) => (
            <div
              key={deal.id}
              className={`bg-white border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 animate-fadeIn ${
                index === 0 
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-white' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {index === 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        BEST DEAL
                      </span>
                    )}
                    <h4 className="font-bold text-lg text-gray-900">{deal.provider}</h4>
                  </div>
                  <p className="text-gray-600 mb-4">{deal.tariffName}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price/kWh</p>
                      <p className="font-bold text-gray-900">£{deal.pricePerKwh.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Annual Cost</p>
                      <p className="font-bold text-gray-900">£{deal.estimatedAnnualCost.toFixed(2)}</p>
                    </div>
                    {deal.savings && deal.savings > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Savings</p>
                        <p className="font-bold text-green-600 text-lg">£{deal.savings.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

