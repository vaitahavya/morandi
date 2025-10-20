import { NextRequest, NextResponse } from 'next/server';
import { uploadImageLocal, validateImageFile } from '@/lib/local-image-upload';
import { 
  uploadImageToSupabase, 
  validateImageFileForSupabase 
} from '@/lib/supabase-image-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    // Use Supabase for products folder, local storage for others
    if (folder === 'products') {
      // Validate file for Supabase
      const validation = validateImageFileForSupabase(file);
      if (!validation.success) {
        return NextResponse.json({
          success: false,
          message: validation.error
        }, { status: 400 });
      }

      // Upload to Supabase Storage
      const result = await uploadImageToSupabase(file, 'products', '', fileName);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          message: 'Upload failed',
          error: result.error
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Image uploaded successfully to Supabase',
        url: result.url
      });
    } else {
      // Use local storage for other folders
      const validation = validateImageFile(file);
      if (!validation.success) {
        return NextResponse.json({
          success: false,
          message: validation.error
        }, { status: 400 });
      }

      // Upload file locally
      const result = await uploadImageLocal(file, folder, fileName);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          message: 'Upload failed',
          error: result.error
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Image uploaded successfully',
        url: result.url
      });
    }

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Upload failed',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image upload endpoint',
    usage: 'POST with formData containing "file" and optional "folder" and "fileName"'
  });
} 