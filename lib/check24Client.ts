// ComparisonDeal type is not part of the medical services app
// This service is for contract comparison features
interface ComparisonDeal {
  [key: string]: any;
}

// Contract comparison features are not part of the medical services app
// To use: npm install cheerio

export class Check24Client {
  async fetchDeals(zipcode: string, consumption: number): Promise<ComparisonDeal[]> {
    throw new Error('Comparison feature is not available. This requires: npm install cheerio');
  }

  async fetchDealsFromContract(contract: { rawText?: string; annualConsumption?: number }): Promise<ComparisonDeal[]> {
    throw new Error('Comparison feature is not available. This requires: npm install cheerio');
  }
}
