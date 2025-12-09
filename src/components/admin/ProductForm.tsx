'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Plus,

  Star,
  Package
} from 'lucide-react';
import { Product, ProductCategory, createProduct, updateProduct, getCategories } from '@/lib/products-api';

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    regularPrice: product?.regularPrice || 0,
    salePrice: product?.salePrice || 0,
    stockQuantity: product?.stockQuantity || 0,
    stockStatus: product?.stockStatus || 'instock',
    manageStock: product?.manageStock !== false,
    lowStockThreshold: product?.lowStockThreshold || 5,
    weight: product?.weight || '',
    dimensions: product?.dimensions || { length: '', width: '', height: '', unit: 'cm' },
    status: product?.status || 'published',
    featured: product?.featured || false,
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    images: product?.images || [],
    featuredImage: product?.featuredImage || '',
    selectedCategories: product?.categories?.map(c => c.id) || [],
    variants: product?.variants || [],
    // Legacy fields
    category: product?.category || '',
    tags: product?.tags || []
  });

  // Load categories
  const loadCategories = async () => {
    try {
      const cats = await getCategories({ flat: true });
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Listen for storage events to refresh categories when they're updated in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'categories-updated') {
        loadCategories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!product && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  // Set regular price equal to price if not set
  useEffect(() => {
    if (formData.price && !formData.regularPrice) {
      setFormData(prev => ({ ...prev, regularPrice: formData.price }));
    }
  }, [formData.price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out blob URLs from images (they're temporary and shouldn't be saved)
      const validImages = formData.images.filter((img: any) => {
        const src = typeof img === 'string' ? img : img?.src;
        return src && !src.startsWith('blob:');
      });

      // Prepare the data
      const productData = {
        ...formData,
        images: validImages, // Use filtered images
        price: parseFloat(formData.price.toString()),
        regularPrice: parseFloat(formData.regularPrice.toString()),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice.toString()) : undefined,
        stockQuantity: parseInt(formData.stockQuantity.toString()),
        lowStockThreshold: parseInt(formData.lowStockThreshold.toString()),
        weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
        dimensions: formData.dimensions.length || formData.dimensions.width || formData.dimensions.height 
          ? formData.dimensions 
          : null,
        tags: Array.isArray(formData.tags) ? formData.tags : 
              typeof formData.tags === 'string' ? (formData.tags as string).split(',').map(t => t.trim()).filter(Boolean) : [],
        variants: formData.variants || []
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file before upload
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has invalid type. Only JPEG, PNG, WebP, and GIF are allowed.`);
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // Response is not JSON (likely HTML error page)
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200));
          
          // Try to extract error message from HTML or use status text
          let errorMessage = `Upload failed with status ${response.status}`;
          if (response.status === 413) {
            errorMessage = `File "${file.name}" is too large. Maximum size is 10MB.`;
          } else if (response.status === 504 || response.status === 408) {
            errorMessage = `Upload timeout. The file "${file.name}" may be too large or the server is slow.`;
          } else if (text.includes('Request Entity Too Large')) {
            errorMessage = `File "${file.name}" is too large. Maximum size is 10MB.`;
          } else if (text.includes('timeout') || text.includes('Timeout')) {
            errorMessage = `Upload timeout for "${file.name}". Please try again with a smaller file.`;
          } else {
            errorMessage = `Upload failed: ${response.statusText || 'Unknown error'}`;
          }
          
          throw new Error(`${file.name}: ${errorMessage}`);
        }
        
        if (!response.ok || !result.success) {
          // Provide more detailed error messages
          let errorMessage = result.error || result.message || 'Failed to upload image';
          
          // Check for common Supabase errors
          if (errorMessage.includes('Supabase is not configured')) {
            errorMessage = 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';
          } else if (errorMessage.includes('Bucket') || errorMessage.includes('bucket')) {
            errorMessage = `Storage error: ${errorMessage}. Please check if the "products" bucket exists and is public in Supabase.`;
          } else if (errorMessage.includes('policy') || errorMessage.includes('RLS')) {
            errorMessage = `Permission error: ${errorMessage}. Please check RLS policies in Supabase Storage.`;
          }
          
          throw new Error(`${file.name}: ${errorMessage}`);
        }
        
        return {
          id: Date.now() + Math.random(),
          src: result.url,
          alt: file.name
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        featuredImage: prev.featuredImage || newImages[0]?.src || ''
      }));
      
      // Clear file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      setError(errorMessage);
      
      // Show error for a longer time so user can read it
      setTimeout(() => {
        // Error will persist until next upload attempt or form submission
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        featuredImage: prev.featuredImage === (typeof prev.images[index] === 'string' ? prev.images[index] : prev.images[index]?.src)
          ? (newImages[0]?.src || '') 
          : prev.featuredImage
      };
    });
  };

  const setFeaturedImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, images: newImages };
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedImage(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedImage !== null) {
      moveImage(draggedImage, dropIndex);
      setDraggedImage(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Slug *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Regular Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.regularPrice}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        regularPrice: parseFloat(e.target.value) || 0,
                        price: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.salePrice || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        salePrice: parseFloat(e.target.value) || 0,
                        price: parseFloat(e.target.value) || prev.regularPrice
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      value={formData.price}
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.manageStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, manageStock: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Manage Stock</span>
                  </label>
                </div>

                {formData.manageStock && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.stockStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockStatus: e.target.value }))}
                      >
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload product images. The first image will be used as the featured image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload images</p>
                    </div>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-move"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <img
                          src={typeof image === 'string' ? image : image.src}
                          alt={typeof image === 'string' ? `Product ${index + 1}` : image.alt}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFeaturedImage(typeof image === 'string' ? image : image.src)}
                              className="p-1 bg-white rounded text-yellow-600 hover:text-yellow-700"
                              title="Set as featured"
                            >
                              <Star className={`h-4 w-4 ${formData.featuredImage === (typeof image === 'string' ? image : image.src) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 bg-white rounded text-red-600 hover:text-red-700"
                              title="Remove image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {formData.featuredImage === (typeof image === 'string' ? image : image.src) && (
                          <Badge className="absolute top-1 left-1 text-xs">Featured</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Variations
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Generate size variations only
                        const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
                        
                        const newVariants: any[] = [];
                        sizes.forEach(size => {
                          newVariants.push({
                            id: `temp-${Date.now()}-${size}`,
                            name: `Size ${size}`,
                            sku: formData.sku ? `${formData.sku}-${size}` : '',
                            price: formData.price,
                            regularPrice: formData.regularPrice,
                            salePrice: formData.salePrice || 0,
                            stockQuantity: 0,
                            stockStatus: 'instock',
                            attributes: [
                              { name: 'Size', value: size }
                            ],
                            images: [],
                            weight: null,
                            dimensions: null
                          });
                        });
                        
                        setFormData(prev => ({ ...prev, variants: newVariants }));
                      }}
                      className="text-xs"
                    >
                      Generate Matrix
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        variants: [...(prev.variants || []), {
                          id: `temp-${Date.now()}`,
                          name: '',
                          sku: '',
                          price: formData.price,
                          regularPrice: formData.regularPrice,
                          salePrice: formData.salePrice || 0,
                          stockQuantity: 0,
                          stockStatus: 'instock',
                          attributes: [],
                          images: [],
                          weight: null,
                          dimensions: null
                        }]
                      }))}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add One
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Create product variations like different sizes, colors, or combinations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-4">
                    {formData.variants.map((variant: any, index: number) => (
                      <div key={variant.id || index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Variation {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              variants: prev.variants.filter((_: any, i: number) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variation Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Red - Large"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={variant.name}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].name = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              placeholder="Variant SKU"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={variant.sku || ''}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].sku = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                        </div>

                        {/* Attributes (Color, Size, etc.) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attributes (e.g., Color, Size)
                          </label>
                          <div className="space-y-2">
                            {variant.attributes && variant.attributes.map((attr: any, attrIndex: number) => (
                              <div key={attrIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Attribute name (e.g., Color)"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                  value={attr.name}
                                  onChange={(e) => {
                                    const newVariants = [...formData.variants];
                                    newVariants[index].attributes[attrIndex].name = e.target.value;
                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Value (e.g., Red)"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                  value={attr.value}
                                  onChange={(e) => {
                                    const newVariants = [...formData.variants];
                                    newVariants[index].attributes[attrIndex].value = e.target.value;
                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newVariants = [...formData.variants];
                                    newVariants[index].attributes = newVariants[index].attributes.filter((_: any, i: number) => i !== attrIndex);
                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newVariants = [...formData.variants];
                                if (!newVariants[index].attributes) {
                                  newVariants[index].attributes = [];
                                }
                                newVariants[index].attributes.push({ name: '', value: '' });
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Attribute
                            </Button>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Regular Price (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              value={variant.regularPrice || ''}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].regularPrice = parseFloat(e.target.value) || 0;
                                newVariants[index].price = parseFloat(e.target.value) || 0;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sale Price (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              value={variant.salePrice || ''}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                const salePrice = parseFloat(e.target.value) || 0;
                                newVariants[index].salePrice = salePrice;
                                if (salePrice > 0) {
                                  newVariants[index].price = salePrice;
                                } else {
                                  newVariants[index].price = newVariants[index].regularPrice || newVariants[index].price || 0;
                                }
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              value={variant.stockQuantity || 0}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].stockQuantity = parseInt(e.target.value) || 0;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Status
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={variant.stockStatus || 'instock'}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].stockStatus = e.target.value;
                              setFormData(prev => ({ ...prev, variants: newVariants }));
                            }}
                          >
                            <option value="instock">In Stock</option>
                            <option value="outofstock">Out of Stock</option>
                            <option value="onbackorder">On Backorder</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No variations added yet.</p>
                    <p className="text-sm">Click "Add Variation" to create size or color options.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Categories & Tags
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/admin?section=categories', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Manage Categories
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  {categories.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-4 text-center">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">No categories available</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/admin?section=categories', '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Category
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.selectedCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedCategories: [...prev.selectedCategories, category.id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedCategories: prev.selectedCategories.filter(id => id !== category.id)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    placeholder="fashion, clothing, summer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Leave empty to use product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Leave empty to use short description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, length: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, width: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, height: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}