import { NextRequest, NextResponse } from 'next/server';
import { EnergyContract } from '@/lib/types';
import { fetchComparisonDeals, calculateSavings } from '@/lib/comparisonService';

export async function POST(request: NextRequest) {
  try {
    const contract: EnergyContract = await request.json();

    if (!contract) {
      return NextResponse.json({ error: 'No contract data provided' }, { status: 400 });
    }

    // Fetch deals from comparison API
    const deals = await fetchComparisonDeals(contract);

    // Calculate savings and recommendations
    const results = calculateSavings(contract, deals);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparisons: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

