// Contract parsing features are not part of the medical services app
// To use: npm install pdf-parse tesseract.js

export async function parsePDF(buffer: Buffer): Promise<string> {
  throw new Error('PDF parsing feature is not available. This requires: npm install pdf-parse');
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  throw new Error('Image OCR feature is not available. This requires: npm install tesseract.js');
}
