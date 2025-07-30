import fs from 'fs';
import path from 'path';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to local storage (development only)
 * @param file - File object to upload
 * @param folder - Folder name (e.g., 'products', 'users')
 * @param fileName - Optional custom filename
 */
export async function uploadImageLocal(
  file: File,
  folder: string = 'uploads',
  fileName?: string
): Promise<UploadResult> {
  try {
    // Generate filename if not provided
    const finalFileName = fileName || `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, finalFileName);
    const publicUrl = `/uploads/${folder}/${finalFileName}`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Local image upload failed:', error);
    return {
      success: false,
      error: 'Upload failed'
    };
  }
}

/**
 * Delete image from local storage
 * @param filePath - Path to the file to delete (relative to public/uploads)
 */
export async function deleteImageLocal(filePath: string): Promise<UploadResult> {
  try {
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: 'File not found'
      };
    }

  } catch (error) {
    console.error('Local image deletion failed:', error);
    return {
      success: false,
      error: 'Deletion failed'
    };
  }
}

/**
 * Get optimized image URL (for local storage, just return the URL)
 * @param url - Original image URL
 * @param width - Desired width (not used in local storage)
 * @param height - Desired height (not used in local storage)
 * @param quality - Image quality (not used in local storage)
 */
export function getOptimizedImageUrlLocal(
  url: string,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): string {
  // For local storage, we can't do server-side optimization
  // You might want to use client-side optimization libraries
  return url;
}

/**
 * Validate file type and size
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default: 5MB)
 */
export function validateImageFile(file: File, maxSize: number = 5 * 1024 * 1024): UploadResult {
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