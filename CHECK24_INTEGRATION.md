# Check24 API Integration

## Overview

The application now integrates with Check24's electricity price comparison service to fetch real-time energy deals. The integration uses Check24's two-step process to retrieve tariff information.

## How It Works

### 1. Contract Analysis
- The AI extracts contract data including:
  - German postal code (5 digits)
  - Annual consumption (kWh)
  - Current tariff details

### 2. Check24 API Flow

**Step 1: Generate Calculation Parameters**
- Makes GET request to: `https://energie.check24.de/ergebnis/strom/`
- Parameters: `zipcode`, `totalconsumption`
- Extracts `calculationParameterId` from redirect response

**Step 2: Retrieve Tariff Results**
- Uses `calculationParameterId` to fetch results page
- Parses HTML response to extract tariff data
- Maps data to `ComparisonDeal` format

### 3. Data Extraction

The integration uses multiple methods to extract tariff data:
- Primary: Parses HTML using Cheerio
- Fallback 1: Extracts from React Router context (if available)
- Fallback 2: Pattern matching for price information

## Requirements

### Contract Requirements
- Contract must contain a **German postal code** (5 digits, e.g., "10115")
- Annual consumption should be specified (defaults to 3000 kWh if not found)

### Dependencies
- `cheerio`: HTML parsing library
- Node.js 18.17+ (for Next.js 14)

## Data Mapping

Check24 data is mapped to our `ComparisonDeal` interface:

| Check24 Field | Our Field | Notes |
|--------------|-----------|-------|
| `workPrice` (Ct./kWh) | `pricePerKwh` (€/kWh) | Converted from cents to euros |
| `basePrice` (€/Monat) | `standingCharge` (€/day) | Converted from monthly to daily |
| `contractDuration` | `contractLength` | In months |
| `estimatedAnnualCost` | `estimatedAnnualCost` | Direct mapping |
| `rating` | `rating` | Provider rating (if available) |
| `provider` | `provider` | Provider name |
| `tariffName` | `tariffName` | Tariff name |

## Error Handling

The integration includes comprehensive error handling:
- Missing postal code: Clear error message
- API failures: Graceful error handling with user-friendly messages
- HTML parsing failures: Multiple fallback methods
- Rate limiting: Built-in delays between requests

## Rate Limiting

The integration respects Check24's servers:
- 1-2 second delay between requests
- Proper User-Agent headers
- Session management

## Legal Considerations

⚠️ **Important**: This integration is for educational purposes. Before production use:
- Review Check24's Terms of Service
- Consider contacting Check24 for official API access
- Respect rate limiting and fair use policies
- Do not overload their servers

## Testing

To test the integration:
1. Upload a contract with a German postal code
2. Ensure annual consumption is specified
3. The system will automatically:
   - Extract postal code and consumption
   - Fetch deals from Check24
   - Display results with savings calculations

## Troubleshooting

### "Could not extract German postal code"
- Ensure contract contains a 5-digit German postal code
- Example formats: "10115", "80331", "20095"

### "Failed to generate calculation parameters"
- Check internet connection
- Verify Check24 service is accessible
- May indicate rate limiting (wait and retry)

### "Failed to parse tariff HTML"
- Check24 may have changed their HTML structure
- The integration includes fallback parsing methods
- Check browser console for detailed errors

## Future Improvements

Potential enhancements:
1. Caching calculation parameter IDs
2. Support for additional filters (contract duration, eco-friendly, etc.)
3. Better HTML parsing with updated selectors
4. Official API integration if available
5. Support for other comparison services


