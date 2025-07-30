'use client';

import React, { useState } from 'react';
import { ImageUpload, DragDropImageUpload } from '@/components/ui/ImageUpload';

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUpload = (url: string) => {
    setUploadedImages(prev => [...prev, url]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Upload Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Simple Upload */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Simple Upload</h2>
          <ImageUpload 
            onUpload={handleUpload}
            folder="test"
            className="p-4 border rounded-lg"
          />
        </div>

        {/* Drag & Drop Upload */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Drag & Drop Upload</h2>
          <DragDropImageUpload 
            onUpload={handleUpload}
            folder="test"
            className="p-4"
          />
        </div>
      </div>

      {/* Display Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="space-y-2">
                <img 
                  src={url} 
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600 truncate">{url}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Images are saved to <code>public/uploads/</code> directory</li>
          <li>Files are accessible via <code>/uploads/folder/filename</code> URLs</li>
          <li>Maximum file size: 5MB</li>
          <li>Supported formats: JPEG, PNG, WebP, GIF</li>
          <li>Files are automatically renamed to prevent conflicts</li>
        </ul>
      </div>
    </div>
  );
} 