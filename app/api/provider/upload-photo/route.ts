import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = requireAuth(authHeader);
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Only providers can upload photos' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' or 'gallery'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Convert file to base64 (for development - in production, use cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    const profile = db.getProviderProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    if (type === 'profile') {
      // Update profile photo
      db.updateProviderProfile(profile.id, {
        profilePhoto: dataUrl,
      });
    } else if (type === 'gallery') {
      // Add to gallery
      const gallery = profile.gallery || [];
      gallery.push(dataUrl);
      db.updateProviderProfile(profile.id, {
        gallery,
      });
    }
    
    return NextResponse.json({
      success: true,
      url: dataUrl,
      message: type === 'profile' ? 'Profile photo updated' : 'Photo added to gallery',
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

