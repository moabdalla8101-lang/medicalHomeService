import OpenAI from 'openai';
import { EnergyContract } from './types';

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null;

try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('OPENAI_API_KEY is not set or empty');
  } else {
    openai = new OpenAI({
      apiKey: apiKey.trim(),
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

export async function extractContractDataFromImage(imageBuffer: Buffer, mimeType: string): Promise<EnergyContract> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please check your .env.local file.');
  }

  try {
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Much cheaper than GPT-4o, still supports vision
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured data from energy contracts. Analyze the image and return ONLY a valid JSON object with the contract information.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the following information from this energy contract image. Return ONLY a valid JSON object with these fields (use null if not found):
{
  "tariffName": string or null,
  "provider": string or null,
  "pricePerKwh": number or null,
  "standingCharge": number or null,
  "contractLength": number (in months) or null,
  "cancellationTerms": string or null,
  "contractStartDate": string (YYYY-MM-DD) or null,
  "contractEndDate": string (YYYY-MM-DD) or null,
  "annualConsumption": number (kWh) or null,
  "paymentMethod": string or null,
  "postcode": string or null
}

CRITICAL: Look for a German postal code (5 digits, e.g., "10115", "80331", "20095"). This is essential for price comparison.

Pay special attention to:
- German postal code (5 digits) - MUST be included in the "postcode" field
- Annual consumption in kWh
- Price per kWh (may be in cents or euros - convert to euros)
- Standing charge (Grundpreis) in €/month

Return ONLY the JSON object, no other text:`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const contract = JSON.parse(response) as EnergyContract & { postcode?: string };
    
    // Extract postal code from the response and include it in rawText for Check24 client
    const postcode = contract.postcode || '';
    const consumptionText = contract.annualConsumption ? `${contract.annualConsumption} kWh` : 'unknown';
    
    // Build rawText with postal code for Check24 extraction
    contract.rawText = `Postal Code: ${postcode}. Annual Consumption: ${consumptionText}. Provider: ${contract.provider || 'unknown'}. Tariff: ${contract.tariffName || 'unknown'}.`;
    
    // Remove postcode from contract object as it's not part of EnergyContract interface
    delete (contract as any).postcode;
    
    return contract;
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    // Handle specific OpenAI API errors
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('billing')) {
      throw new Error(
        'OpenAI API quota exceeded or billing issue. Please:\n' +
        '1. Check your OpenAI account balance at https://platform.openai.com/account/billing\n' +
        '2. Verify your API key is correct\n' +
        '3. Add payment method if needed\n' +
        '4. Try using manual entry instead while you resolve this issue'
      );
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('invalid')) {
      throw new Error(
        'Invalid OpenAI API key. Please check your .env.local file and ensure the API key is correct.'
      );
    }
    
    throw new Error('Failed to extract contract data from image: ' + errorMessage);
  }
}

export async function extractContractData(text: string): Promise<EnergyContract> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please check your .env.local file.');
  }

  // Check if text is too short or empty
  if (!text || text.trim().length < 50) {
    throw new Error('Extracted text is too short or empty. The PDF might be image-based (scanned document). Please try uploading as an image instead.');
  }

  const prompt = `Extract the following information from this energy contract text. Return ONLY a valid JSON object with these fields (use null if not found):
{
  "tariffName": string or null,
  "provider": string or null,
  "pricePerKwh": number or null,
  "standingCharge": number or null,
  "contractLength": number (in months) or null,
  "cancellationTerms": string or null,
  "contractStartDate": string (YYYY-MM-DD) or null,
  "contractEndDate": string (YYYY-MM-DD) or null,
  "annualConsumption": number (kWh) or null,
  "paymentMethod": string or null,
  "postcode": string (5-digit German postal code) or null
}

CRITICAL: Look for a German postal code (5 digits, e.g., "10115", "80331", "20095"). This is essential for price comparison.

Contract text:
${text.substring(0, 8000)}${text.length > 8000 ? '... (text truncated)' : ''}

Return ONLY the JSON object, no other text:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Much cheaper than GPT-4-turbo, good for structured extraction
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured data from energy contracts. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const contract = JSON.parse(response) as EnergyContract & { postcode?: string };
    
    // Extract postal code from the response and include it in rawText for Check24 client
    const postcode = contract.postcode || '';
    const consumptionText = contract.annualConsumption ? `${contract.annualConsumption} kWh` : 'unknown';
    
    // Build rawText with postal code for Check24 extraction
    contract.rawText = `Postal Code: ${postcode}. Annual Consumption: ${consumptionText}. Provider: ${contract.provider || 'unknown'}. Tariff: ${contract.tariffName || 'unknown'}.`;
    
    // Remove postcode from contract object as it's not part of EnergyContract interface
    delete (contract as any).postcode;
    
    console.log('Extracted contract data:', {
      provider: contract.provider,
      tariffName: contract.tariffName,
      annualConsumption: contract.annualConsumption,
      pricePerKwh: contract.pricePerKwh,
      postcode: postcode || 'not found',
    });
    
    return contract;
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    // Handle specific OpenAI API errors
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('billing')) {
      throw new Error(
        'OpenAI API quota exceeded or billing issue. Please:\n' +
        '1. Check your OpenAI account balance at https://platform.openai.com/account/billing\n' +
        '2. Verify your API key is correct\n' +
        '3. Add payment method if needed\n' +
        '4. Try using manual entry instead while you resolve this issue'
      );
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('invalid')) {
      throw new Error(
        'Invalid OpenAI API key. Please check your .env.local file and ensure the API key is correct.'
      );
    }
    
    throw new Error('Failed to extract contract data: ' + errorMessage);
  }
}

