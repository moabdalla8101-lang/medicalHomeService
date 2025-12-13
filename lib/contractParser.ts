import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';
    
    if (!text || text.trim().length === 0) {
      throw new Error('PDF appears to be empty or image-based (scanned document). Please try uploading as an image instead.');
    }
    
    console.log('PDF parsed successfully. Text length:', text.length);
    return text;
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('empty') || errorMessage.includes('image-based')) {
      throw error; // Re-throw our custom error
    }
    throw new Error('Failed to parse PDF: ' + errorMessage);
  }
}

/**
 * Extract text from image using free Tesseract.js OCR
 * This is a free alternative to OpenAI Vision API
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker('eng+deu'); // English + German for better results
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
  } catch (error) {
    throw new Error('Failed to extract text from image: ' + (error as Error).message);
  }
}

