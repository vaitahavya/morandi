import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes image paths to ensure they work with Next.js Image component
 * @param imagePath - The image path to normalize
 * @param fallback - Fallback image path if the input is invalid
 * @returns A properly formatted image path
 */
export function normalizeImagePath(imagePath: string | null | undefined, fallback: string = '/images/banners/hero-main.jpg'): string {
  if (!imagePath) {
    return fallback;
  }
  
  // If it's already an absolute URL or starts with a slash, return as is
  if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Add leading slash for relative paths
  return `/${imagePath}`;
} 