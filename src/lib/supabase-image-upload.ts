import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 * @param file - File object to upload
 * @param bucket - Supabase storage bucket name
 * @param folder - Folder path within the bucket (e.g., 'products', 'users')
 * @param fileName - Optional custom filename
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string,
  folder: string = '',
  fileName?: string
): Promise<UploadResult> {
  try {
    // Generate filename if not provided
    const finalFileName = fileName || `${Date.now()}-${file.name}`;
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Supabase image upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete image from Supabase Storage
 * @param bucket - Supabase storage bucket name
 * @param filePath - Path to the file to delete
 */
export async function deleteImageFromSupabase(
  bucket: string,
  filePath: string
): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Supabase image deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed'
    };
  }
}

/**
 * Get optimized image URL from Supabase Storage
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 */
export function getOptimizedImageUrlFromSupabase(
  url: string,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): string {
  // Supabase Storage supports some transformations via URL parameters
  const urlObj = new URL(url);
  urlObj.searchParams.set('width', width.toString());
  urlObj.searchParams.set('height', height.toString());
  urlObj.searchParams.set('quality', quality.toString());
  urlObj.searchParams.set('resize', 'cover');
  
  return urlObj.toString();
}

/**
 * Validate file type and size for Supabase uploads
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default: 10MB)
 */
export function validateImageFileForSupabase(
  file: File, 
  maxSize: number = 10 * 1024 * 1024
): UploadResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
    };
  }

  return {
    success: true
  };
}

/**
 * List images in a Supabase Storage bucket folder
 * @param bucket - Supabase storage bucket name
 * @param folder - Folder path within the bucket
 */
export async function listImagesInSupabase(
  bucket: string,
  folder: string = ''
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('Supabase list error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      files: data
    };

  } catch (error) {
    console.error('Supabase list images failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'List failed'
    };
  }
}
