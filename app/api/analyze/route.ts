import { NextRequest, NextResponse } from 'next/server';
// Contract analysis features are not part of the medical services app
// Uncomment and install dependencies if needed: npm install openai pdf-parse tesseract.js

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Contract analysis feature is not available in this version' },
    { status: 501 }
  );
}
