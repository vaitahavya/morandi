'use client';

import React, { useState } from 'react';
import { Button } from './button';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
}

export function ImageUpload({ 
  onUpload, 
  folder = 'uploads', 
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);
    setIsUploading(true);

    try {
      // Validate file size
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Upload file
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.url) {
        onUpload(result.url);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button 
          type="button" 
          variant="outline" 
          disabled={isUploading}
          className="cursor-pointer"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </label>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

// Drag and drop version
export function DragDropImageUpload({ 
  onUpload, 
  folder = 'uploads', 
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Validate file size
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Upload file
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.url) {
        onUpload(result.url);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleUpload(imageFile);
    } else {
      setError('Please drop an image file.');
    }
  };

  return (
    <div className={className}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag and drop an image here, or click to select
            </p>
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              disabled={isUploading}
              className="hidden"
              id="drag-drop-upload"
            />
            <label htmlFor="drag-drop-upload">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading}
                className="cursor-pointer"
              >
                Select Image
              </Button>
            </label>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
} 