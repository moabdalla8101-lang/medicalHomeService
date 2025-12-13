// EnergyContract type is not part of the medical services app
// This service is for contract analysis features
interface EnergyContract {
  [key: string]: any;
}

// Contract analysis features are not part of the medical services app
// To use: npm install openai

export async function extractContractDataFromImage(imageBuffer: Buffer, mimeType: string): Promise<EnergyContract> {
  throw new Error('Contract analysis feature is not available. This requires: npm install openai');
}

export async function extractContractData(text: string): Promise<EnergyContract> {
  throw new Error('Contract analysis feature is not available. This requires: npm install openai');
}
