import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, extractTextFromImage } from '@/lib/contractParser';
import { extractContractData, extractContractDataFromImage } from '@/lib/aiExtractor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let contract;

    // Handle PDF files
    if (file.type === 'application/pdf') {
      const buffer = Buffer.from(await file.arrayBuffer());
      console.log('PDF file received, size:', buffer.length, 'bytes');
      
      const text = await parsePDF(buffer);
      console.log('PDF text extracted, length:', text.length, 'characters');
      console.log('PDF text preview (first 500 chars):', text.substring(0, 500));
      
      if (!text || text.trim().length === 0) {
        throw new Error('PDF appears to be empty or could not extract text. The PDF might be image-based (scanned). Please try uploading as an image instead.');
      }
      
      contract = await extractContractData(text);
      console.log('Contract data extracted:', JSON.stringify(contract, null, 2));
      
      if (!contract || (!contract.provider && !contract.tariffName && !contract.annualConsumption)) {
        console.warn('Warning: Very little data extracted from PDF. Contract:', contract);
      }
    } 
    // Handle image files
    else if (file.type.startsWith('image/')) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Try free OCR first (Tesseract.js)
      const useFreeOCR = process.env.USE_FREE_OCR === 'true';
      
      if (useFreeOCR) {
        try {
          console.log('Using free Tesseract.js OCR...');
          const text = await extractTextFromImage(buffer);
          contract = await extractContractData(text);
        } catch (ocrError) {
          console.log('Free OCR failed, falling back to OpenAI Vision:', ocrError);
          // Fallback to OpenAI Vision if free OCR fails
          contract = await extractContractDataFromImage(buffer, file.type);
        }
      } else {
        // Use OpenAI Vision (more accurate but costs money)
        contract = await extractContractDataFromImage(buffer, file.type);
      }
    } 
    // Unsupported file type
    else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or image file (JPG, PNG).' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide more helpful error messages
    let statusCode = 500;
    if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('429')) {
      statusCode = 402; // Payment Required
    } else if (errorMessage.includes('401') || errorMessage.includes('invalid')) {
      statusCode = 401; // Unauthorized
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze contract: ' + errorMessage },
      { status: statusCode }
    );
  }
}

