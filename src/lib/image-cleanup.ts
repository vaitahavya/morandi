import { deleteImageFromSupabase } from './supabase-image-upload';

/**
 * Extract file path from Supabase Storage URL
 * @param url - Supabase Storage public URL
 * @returns file path or null if not a Supabase URL
 */
export function extractSupabaseFilePath(url: string): string | null {
  try {
    // Supabase Storage URLs typically look like:
    // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[file-path]
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the index of 'public' in the path
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex === -1 || publicIndex >= pathParts.length - 2) {
      return null;
    }
    
    // Extract bucket and file path
    const bucket = pathParts[publicIndex + 1];
    const filePath = pathParts.slice(publicIndex + 2).join('/');
    
    return filePath;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}

/**
 * Check if a URL is from Supabase Storage
 * @param url - URL to check
 * @returns boolean indicating if it's a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && urlObj.pathname.includes('/storage/v1/object/public/');
  } catch (error) {
    return false;
  }
}

/**
 * Delete images from Supabase Storage
 * @param imageUrls - Array of image URLs to delete
 * @param bucket - Supabase storage bucket name (default: 'products')
 */
export async function cleanupSupabaseImages(
  imageUrls: string[],
  bucket: string = 'products'
): Promise<{ success: boolean; deleted: string[]; errors: string[] }> {
  const deleted: string[] = [];
  const errors: string[] = [];

  for (const url of imageUrls) {
    if (!isSupabaseStorageUrl(url)) {
      continue; // Skip non-Supabase URLs
    }

    const filePath = extractSupabaseFilePath(url);
    if (!filePath) {
      errors.push(`Could not extract file path from URL: ${url}`);
      continue;
    }

    try {
      const result = await deleteImageFromSupabase(bucket, filePath);
      if (result.success) {
        deleted.push(url);
      } else {
        errors.push(`Failed to delete ${url}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Error deleting ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    deleted,
    errors
  };
}

/**
 * Compare two arrays of image URLs and return URLs that were removed
 * @param oldImages - Previous image URLs
 * @param newImages - Current image URLs
 * @returns Array of URLs that were removed
 */
export function getRemovedImageUrls(oldImages: string[], newImages: string[]): string[] {
  const oldSet = new Set(oldImages);
  const newSet = new Set(newImages);
  
  return oldImages.filter(url => !newSet.has(url));
}

/**
 * Parse images from various formats (string, array, JSON string)
 * @param images - Images in various formats
 * @returns Array of image URLs
 */
export function parseImageUrls(images: any): string[] {
  if (!images) return [];
  
  if (typeof images === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.map(img => typeof img === 'string' ? img : img?.src || '').filter(Boolean);
      }
    } catch {
      // If not JSON, treat as single URL
      return [images];
    }
  }
  
  if (Array.isArray(images)) {
    return images.map(img => typeof img === 'string' ? img : img?.src || '').filter(Boolean);
  }
  
  return [];
}
