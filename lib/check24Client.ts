import * as cheerio from 'cheerio';
import { ComparisonDeal } from './types';

interface Check24TariffData {
  provider: string;
  tariffName: string;
  rating?: number;
  workPrice: number; // Ct./kWh
  basePrice: number; // €/Monat
  contractDuration: number; // months
  estimatedAnnualCost: number;
  estimatedMonthlyCost: number;
  bonuses?: {
    sofortbonus?: number;
    wechselbonus?: number;
    check24Bonus?: number;
  };
  priceGuarantee?: string;
  ecoType?: string;
}

export class Check24Client {
  private baseUrl = 'https://energie.check24.de';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Extract German postal code from text
   */
  private extractPostcode(text: string): string | null {
    // German postcodes are 5 digits
    const match = text.match(/\b\d{5}\b/);
    return match ? match[0] : null;
  }

  /**
   * Step 1: Generate calculation parameters
   */
  private async generateCalculationParameters(
    zipcode: string,
    consumption: number
  ): Promise<string> {
    const url = `${this.baseUrl}/ergebnis/strom/?zipcode=${zipcode}&totalconsumption=${consumption}&pid=24`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Referer': 'https://www.check24.de/strom/',
        },
        redirect: 'manual', // Don't follow redirect automatically
      });

      console.log('Check24 API Response Status:', response.status);
      console.log('Check24 API Response Headers:', Object.fromEntries(response.headers.entries()));

      // Extract calculationParameterId from Location header
      if (response.status === 302 || response.status === 301 || response.status === 307 || response.status === 308) {
        const location = response.headers.get('location');
        if (location) {
          // Handle both absolute and relative URLs
          const locationUrl = location.startsWith('http') ? location : `${this.baseUrl}${location}`;
          const match = locationUrl.match(/calculationParameterId=([^&?#]+)/);
          if (match && match[1]) {
            console.log('Found calculationParameterId in redirect:', match[1]);
            return match[1];
          }
        }
      }

      // If redirect header not found, try to extract from response body
      const html = await response.text();
      console.log('Response HTML length:', html.length);
      
      // Try multiple patterns to find the calculation parameter ID
      const patterns = [
        /calculationParameterId=([a-f0-9]{32,})/i,
        /calculationParameterId['"]?\s*[:=]\s*['"]?([a-f0-9]{32,})/i,
        /calculationParameterId['"]?\s*=\s*['"]?([^"&' ]+)/i,
        /calculationParameterId=([^"&'?#\s]+)/i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          console.log('Found calculationParameterId in HTML:', match[1]);
          return match[1];
        }
      }

      // Try following redirects automatically as fallback
      console.log('Trying with automatic redirect following...');
      const followResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Referer': 'https://www.check24.de/strom/',
        },
        redirect: 'follow',
      });

      const finalUrl = followResponse.url;
      console.log('Final URL after redirect:', finalUrl);
      const urlMatch = finalUrl.match(/calculationParameterId=([^&?#]+)/);
      if (urlMatch && urlMatch[1]) {
        console.log('Found calculationParameterId in final URL:', urlMatch[1]);
        return urlMatch[1];
      }

      throw new Error(`Could not extract calculation parameter ID. Response status: ${response.status}, Final URL: ${finalUrl}`);
    } catch (error) {
      console.error('Error generating calculation parameters:', error);
      throw new Error(`Failed to generate calculation parameters: ${(error as Error).message}`);
    }
  }

  /**
   * Step 2: Retrieve tariff results and parse HTML
   */
  private async fetchTariffResults(calculationParameterId: string): Promise<Check24TariffData[]> {
    const url = `${this.baseUrl}/ergebnis/strom/?calculationParameterId=${calculationParameterId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return this.parseTariffHTML(html);
    } catch (error) {
      console.error('Error fetching tariff results:', error);
      throw new Error(`Failed to fetch tariff results: ${(error as Error).message}`);
    }
  }

  /**
   * Parse HTML to extract tariff data
   */
  private parseTariffHTML(html: string): Check24TariffData[] {
    const $ = cheerio.load(html);
    const tariffs: Check24TariffData[] = [];

    try {
      // Try to extract from React Router context (if available)
      const reactContextMatch = html.match(/window\.__reactRouterContext\s*=\s*({[\s\S]+?});/);
      if (reactContextMatch) {
        try {
          const context = JSON.parse(reactContextMatch[1]);
          // Navigate through context to find tariff data
          // This structure may vary, so we'll also try HTML parsing
        } catch (e) {
          // Continue with HTML parsing
        }
      }

      // Parse tariff cards from HTML
      // Check24 typically uses specific CSS classes or data attributes
      // Common selectors: [data-tariff], .tariff-card, .offer-card, etc.
      
      // Method 1: Try common Check24 selectors
      $('[data-tariff-id], .c24-offer, .offer-item, .tariff-card').each((index, element) => {
        try {
          const $el = $(element);
          
          // Extract provider name
          const provider = $el.find('.provider-name, [data-provider], .c24-provider-name').first().text().trim() ||
                          $el.find('h2, h3, .title').first().text().trim().split(' - ')[0];

          // Extract tariff name
          const tariffName = $el.find('.tariff-name, [data-tariff-name], .c24-tariff-name').first().text().trim() ||
                            $el.find('h2, h3, .title').first().text().trim();

          // Extract work price (Arbeitspreis) - usually in Ct./kWh
          const workPriceText = $el.find('[data-work-price], .work-price, .arbeitspreis').first().text().trim() ||
                              $el.find('.price-per-kwh, .kwh-price').first().text().trim();
          const workPrice = this.parsePrice(workPriceText) || 0;

          // Extract base price (Grundpreis) - usually in €/month
          const basePriceText = $el.find('[data-base-price], .base-price, .grundpreis').first().text().trim() ||
                              $el.find('.monthly-fee, .standing-charge').first().text().trim();
          const basePrice = this.parsePrice(basePriceText) || 0;

          // Extract annual cost
          const annualCostText = $el.find('[data-annual-cost], .annual-cost, .jahrespreis').first().text().trim() ||
                                $el.find('.total-cost, .yearly-cost').first().text().trim();
          const annualCost = this.parsePrice(annualCostText) || 0;

          // Extract monthly cost
          const monthlyCostText = $el.find('[data-monthly-cost], .monthly-cost, .monatspreis').first().text().trim() ||
                                 $el.find('.avg-monthly, .monthly-avg').first().text().trim();
          const monthlyCost = this.parsePrice(monthlyCostText) || 0;

          // Extract contract duration
          const durationText = $el.find('[data-contract-duration], .contract-duration, .laufzeit').first().text().trim();
          const contractDuration = this.parseDuration(durationText) || 12;

          // Extract rating
          const ratingText = $el.find('[data-rating], .rating, .bewertung').first().text().trim();
          const rating = this.parseRating(ratingText);

          if (provider && tariffName && workPrice > 0) {
            tariffs.push({
              provider,
              tariffName,
              rating,
              workPrice: workPrice / 100, // Convert Ct./kWh to €/kWh
              basePrice,
              contractDuration,
              estimatedAnnualCost: annualCost || this.calculateAnnualCost(workPrice / 100, basePrice, 3000),
              estimatedMonthlyCost: monthlyCost || (annualCost || this.calculateAnnualCost(workPrice / 100, basePrice, 3000)) / 12,
            });
          }
        } catch (error) {
          console.error('Error parsing tariff element:', error);
        }
      });

      // Method 2: Fallback - try to extract from JSON-LD or script tags
      if (tariffs.length === 0) {
        $('script[type="application/ld+json"]').each((index, element) => {
          try {
            const json = JSON.parse($(element).html() || '{}');
            // Parse structured data if available
          } catch (e) {
            // Continue
          }
        });
      }

      // Method 3: Generic fallback - look for price patterns in text
      if (tariffs.length === 0) {
        // This is a fallback that tries to extract any price information
        // It's less reliable but may catch some data
        const priceMatches = html.match(/(\d+[.,]\d+)\s*(?:Ct\.|Cent|€)\s*\/\s*kWh/gi);
        if (priceMatches && priceMatches.length > 0) {
          // Create basic tariff entries from found prices
          priceMatches.slice(0, 10).forEach((match, index) => {
            const price = this.parsePrice(match);
            if (price) {
              tariffs.push({
                provider: `Provider ${index + 1}`,
                tariffName: `Tariff ${index + 1}`,
                workPrice: price / 100,
                basePrice: 10, // Default
                contractDuration: 12,
                estimatedAnnualCost: this.calculateAnnualCost(price / 100, 10, 3000),
                estimatedMonthlyCost: this.calculateAnnualCost(price / 100, 10, 3000) / 12,
              });
            }
          });
        }
      }

    } catch (error) {
      console.error('Error parsing HTML:', error);
      throw new Error(`Failed to parse tariff HTML: ${(error as Error).message}`);
    }

    return tariffs;
  }

  /**
   * Parse price from text (handles both € and Ct. formats)
   */
  private parsePrice(text: string): number | null {
    if (!text) return null;
    
    // Remove currency symbols and extract number
    const cleaned = text.replace(/[€$£,]/g, '').replace(/\./g, '').trim();
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    
    return null;
  }

  /**
   * Parse contract duration from text
   */
  private parseDuration(text: string): number | null {
    if (!text) return null;
    
    const match = text.match(/(\d+)\s*(?:Monat|month)/i);
    if (match) {
      return parseInt(match[1]);
    }
    
    return null;
  }

  /**
   * Parse rating from text
   */
  private parseRating(text: string): number | undefined {
    if (!text) return undefined;
    
    const match = text.match(/(\d+[.,]\d+)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    
    return undefined;
  }

  /**
   * Calculate annual cost from work price, base price, and consumption
   */
  private calculateAnnualCost(workPricePerKwh: number, basePricePerMonth: number, consumption: number): number {
    return (consumption * workPricePerKwh) + (basePricePerMonth * 12);
  }

  /**
   * Main method to fetch comparison deals
   */
  async fetchDeals(zipcode: string, consumption: number): Promise<ComparisonDeal[]> {
    try {
      // Step 1: Generate calculation parameters
      const calculationParameterId = await this.generateCalculationParameters(zipcode, consumption);
      
      // Add a small delay to respect rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Fetch and parse tariff results
      const tariffs = await this.fetchTariffResults(calculationParameterId);
      
      // Step 3: Map to ComparisonDeal format
      return tariffs.map((tariff, index) => ({
        id: `check24-${index}-${Date.now()}`,
        provider: tariff.provider,
        tariffName: tariff.tariffName,
        pricePerKwh: tariff.workPrice,
        standingCharge: tariff.basePrice / 30, // Convert monthly to daily
        contractLength: tariff.contractDuration,
        estimatedAnnualCost: tariff.estimatedAnnualCost,
        rating: tariff.rating,
        features: [
          tariff.ecoType && `Eco: ${tariff.ecoType}`,
          tariff.priceGuarantee && `Price Guarantee: ${tariff.priceGuarantee}`,
        ].filter(Boolean) as string[],
      }));
    } catch (error) {
      console.error('Error fetching Check24 deals:', error);
      throw error;
    }
  }

  /**
   * Extract postcode from contract text and fetch deals
   */
  async fetchDealsFromContract(contract: { rawText?: string; annualConsumption?: number }): Promise<ComparisonDeal[]> {
    const postcode = contract.rawText ? this.extractPostcode(contract.rawText) : null;
    const consumption = contract.annualConsumption || 3000; // Default to 3000 kWh
    
    if (!postcode) {
      throw new Error('Could not extract German postal code from contract. Please ensure the contract contains a 5-digit German postal code.');
    }

    return this.fetchDeals(postcode, consumption);
  }
}

