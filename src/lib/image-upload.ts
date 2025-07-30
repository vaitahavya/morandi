import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 * @param file - File object to upload
 * @param folder - Folder name (e.g., 'products', 'users')
 * @param fileName - Optional custom filename
 */
export async function uploadImage(
  file: File,
  folder: string = 'uploads',
  fileName?: string
): Promise<UploadResult> {
  try {
    // Generate filename if not provided
    const finalFileName = fileName || `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${finalFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images') // You can create different buckets for different purposes
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      error: 'Upload failed'
    };
  }
}

/**
 * Delete image from Supabase Storage
 * @param filePath - Path to the file to delete
 */
export async function deleteImage(filePath: string): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Image deletion failed:', error);
    return {
      success: false,
      error: 'Deletion failed'
    };
  }
}

/**
 * Get optimized image URL with transformations
 * @param url - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 */
export function getOptimizedImageUrl(
  url: string,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): string {
  // For Supabase Storage, you can use query parameters for optimization
  // This is a basic implementation - you might want to use a CDN or image optimization service
  return url;
} 