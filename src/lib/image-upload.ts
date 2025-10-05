// Re-export from generic image upload service
export {
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  type UploadResult,
  type ImageUploadConfig
} from './generic-image-upload';

// Default configuration - you can change this based on your needs
export const defaultImageConfig = {
  provider: 'local' as const,
  config: {
    uploadDir: './public/uploads',
    baseUrl: '/uploads'
  }
};

/**
 * Upload image with default configuration
 * @param file - File object to upload
 * @param folder - Folder name (e.g., 'products', 'users')
 * @param fileName - Optional custom filename
 */
export async function uploadImageWithDefaults(
  file: File,
  folder: string = 'uploads',
  fileName?: string
) {
  const { uploadImage } = await import('./generic-image-upload');
  return uploadImage(file, folder, fileName, defaultImageConfig);
} 