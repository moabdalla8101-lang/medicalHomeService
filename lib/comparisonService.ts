import { EnergyContract, ComparisonDeal, ComparisonResult } from './types';
import { Check24Client } from './check24Client';

const check24Client = new Check24Client();

/**
 * Generate sample comparison deals as fallback when Check24 is unavailable
 */
function generateSampleDeals(contract: EnergyContract): ComparisonDeal[] {
  const consumption = contract.annualConsumption || 3000;
  const currentPrice = contract.pricePerKwh || 0.30;
  const currentStanding = contract.standingCharge || 0.40;
  const currentAnnual = (consumption * currentPrice) + (currentStanding * 365);

  // Generate realistic sample deals with varying prices
  const sampleProviders = [
    { name: 'Vattenfall', basePrice: 0.28, standing: 11.90 },
    { name: 'E.ON', basePrice: 0.29, standing: 12.50 },
    { name: 'EnBW', basePrice: 0.27, standing: 11.20 },
    { name: 'LichtBlick', basePrice: 0.26, standing: 10.80 },
    { name: 'Greenpeace Energy', basePrice: 0.31, standing: 13.00 },
    { name: 'Naturstrom', basePrice: 0.30, standing: 12.00 },
  ];

  return sampleProviders.map((provider, index) => {
    const annualCost = (consumption * provider.basePrice) + (provider.standing * 12);
    const savings = currentAnnual - annualCost;

    return {
      id: `sample-${index}-${Date.now()}`,
      provider: provider.name,
      tariffName: `${provider.name} ÖkoStrom`,
      pricePerKwh: provider.basePrice,
      standingCharge: provider.standing / 30, // Convert monthly to daily
      contractLength: 12,
      estimatedAnnualCost: annualCost,
      savings: savings > 0 ? savings : 0,
      rating: 7.5 + (Math.random() * 1.5), // Random rating between 7.5-9.0
      features: [
        '100% Renewable Energy',
        '12 Month Price Guarantee',
        'No Cancellation Fees',
      ],
    };
  }).sort((a, b) => (b.estimatedAnnualCost || 0) - (a.estimatedAnnualCost || 0)).reverse(); // Sort by cost (cheapest first)
}

export async function fetchComparisonDeals(
  contract: EnergyContract
): Promise<ComparisonDeal[]> {
  // Check if we should use Check24 or fallback to sample data
  const useCheck24 = process.env.USE_CHECK24 !== 'false'; // Default to true, set to 'false' to disable

  if (!useCheck24) {
    console.log('Using sample data (Check24 disabled)');
    return generateSampleDeals(contract);
  }

  try {
    // Use Check24 API to fetch deals
    const deals = await check24Client.fetchDealsFromContract({
      rawText: contract.rawText,
      annualConsumption: contract.annualConsumption || 3000,
    });

    // If we got deals, return them
    if (deals && deals.length > 0) {
      return deals;
    }

    // If no deals returned, fall back to sample data
    console.log('No deals from Check24, using sample data');
    return generateSampleDeals(contract);
  } catch (error) {
    console.error('Comparison API error:', error);
    
    // Provide a more user-friendly error message
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('Could not extract calculation parameter ID') || 
        errorMessage.includes('Failed to generate calculation parameters') ||
        errorMessage.includes('Unable to connect to Check24')) {
      
      console.log('Check24 unavailable, using sample data as fallback');
      // Return sample data instead of throwing error
      return generateSampleDeals(contract);
    }
    
    // For other errors, still try to provide sample data
    console.log('Error fetching from Check24, using sample data as fallback');
    return generateSampleDeals(contract);
  }
}

export function calculateSavings(
  currentContract: EnergyContract,
  deals: ComparisonDeal[]
): ComparisonResult {
  const currentAnnualCost = calculateAnnualCost(currentContract);
  
  const dealsWithSavings = deals.map(deal => ({
    ...deal,
    savings: currentAnnualCost - deal.estimatedAnnualCost,
  }));

  const sortedDeals = dealsWithSavings.sort((a, b) => (b.savings || 0) - (a.savings || 0));
  const recommendedDeal = sortedDeals[0];

  return {
    currentContract,
    deals: sortedDeals,
    recommendedDeal,
    totalSavings: recommendedDeal?.savings,
  };
}

function calculateAnnualCost(contract: EnergyContract): number {
  const consumption = contract.annualConsumption || 3000;
  const kwhPrice = contract.pricePerKwh || 0.3;
  const standing = contract.standingCharge || 0.4;
  
  return (consumption * kwhPrice) + (standing * 365);
}

