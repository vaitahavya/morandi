'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, Share2, Truck, RotateCcw, Shield } from 'lucide-react';
import { getProductBySlug, getProductVariations, ProductVariant } from '@/lib/products-api';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import WishlistButton from '@/components/products/WishlistButton';
import ProductGallery from '@/components/products/ProductGallery';
import VariantSelector, { VariantOption } from '@/components/products/VariantSelector';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewDisplay, { Review } from '@/components/reviews/ReviewDisplay';
import ProductRecommendations from '@/components/products/ProductRecommendations';
import toast from 'react-hot-toast';

interface ProductDetailPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [variations, setVariations] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();

  // Mock reviews data - replace with real data from your backend
  const [reviews] = useState<Review[]>([
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely love this product! The quality is amazing and it fits perfectly.',
      date: '2024-01-15',
    },
    {
      id: 2,
      name: 'Priya K.',
      rating: 4,
      comment: 'Great product, very comfortable and stylish. Would definitely recommend!',
      date: '2024-01-10',
    },
  ]);

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductBySlug(params.slug);
        setProduct(data);
        
        if (data) {
          // Fetch variations if product has them
          const vars = await getProductVariations(data.id);
          setVariations(vars);
          
          // Set initial price
          setCurrentPrice(data.price);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  // Generate color options from variations
  const colorOptions: VariantOption[] = useMemo(() => {
    if (!variations.length) return [];
    
    const colors = new Map<string, { name: string; available: boolean; price?: string }>();
    
    variations.forEach(variant => {
      const colorAttr = variant.attributes.find(attr => 
        attr.name.toLowerCase().includes('color') || attr.name.toLowerCase().includes('colour')
      );
      
      if (colorAttr) {
        const colorName = colorAttr.value;
        const isAvailable = variant.stock_status === 'instock';
        const price = variant.price !== product?.price ? variant.price : undefined;
        
        if (!colors.has(colorName)) {
          colors.set(colorName, { name: colorName, available: isAvailable, price });
        } else {
          // If any variant of this color is available, mark it as available
          const existing = colors.get(colorName)!;
          if (isAvailable) {
            existing.available = true;
          }
        }
      }
    });
    
    return Array.from(colors.entries()).map(([value, data]) => ({
      value,
      ...data
    }));
  }, [variations, product?.price]);

  // Generate size options from variations
  const sizeOptions: VariantOption[] = useMemo(() => {
    if (!variations.length) return [];
    
    const sizes = new Map<string, { name: string; available: boolean; price?: string }>();
    
    variations.forEach(variant => {
      const sizeAttr = variant.attributes.find(attr => 
        attr.name.toLowerCase().includes('size')
      );
      
      if (sizeAttr) {
        const sizeName = sizeAttr.value;
        const isAvailable = variant.stock_status === 'instock';
        const price = variant.price !== product?.price ? variant.price : undefined;
        
        if (!sizes.has(sizeName)) {
          sizes.set(sizeName, { name: sizeName, available: isAvailable, price });
        } else {
          // If any variant of this size is available, mark it as available
          const existing = sizes.get(sizeName)!;
          if (isAvailable) {
            existing.available = true;
          }
        }
      }
    });
    
    return Array.from(sizes.entries()).map(([value, data]) => ({
      value,
      ...data
    }));
  }, [variations, product?.price]);

  // Find matching variant when color or size changes
  useEffect(() => {
    if (!variations.length || (!selectedColor && !selectedSize)) return;
    
    const matchingVariant = variations.find(variant => {
      const colorAttr = variant.attributes.find(attr => 
        attr.name.toLowerCase().includes('color') || attr.name.toLowerCase().includes('colour')
      );
      const sizeAttr = variant.attributes.find(attr => 
        attr.name.toLowerCase().includes('size')
      );
      
      const colorMatch = !selectedColor || colorAttr?.value === selectedColor;
      const sizeMatch = !selectedSize || sizeAttr?.value === selectedSize;
      
      return colorMatch && sizeMatch;
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setCurrentPrice(matchingVariant.price);
    } else {
      setSelectedVariant(null);
      setCurrentPrice(product?.price || '');
    }
  }, [selectedColor, selectedSize, variations, product?.price]);

  const handleAddToCart = () => {
    // Only require size selection if the product has size options
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(currentPrice),
      quantity,
      image: product.images[0]?.src || '',
      variation_id: selectedVariant?.id,
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  const handleReviewSubmit = async (review: { rating: number; comment: string; name: string }) => {
    // TODO: Submit review to your backend
    console.log('Review submitted:', review);
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <ProductGallery 
          images={product.images || []} 
          productName={product.name} 
        />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
            <p className="text-2xl font-bold text-primary-700">₹{currentPrice}</p>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div className="text-gray-700 leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {/* Color Selection */}
          {colorOptions.length > 0 && (
            <VariantSelector
              type="color"
              options={colorOptions}
              selectedValue={selectedColor}
              onSelect={setSelectedColor}
              label="Color"
            />
          )}

          {/* Size Selection */}
          {sizeOptions.length > 0 && (
            <VariantSelector
              type="size"
              options={sizeOptions}
              selectedValue={selectedSize}
              onSelect={setSelectedSize}
              label="Size"
            />
          )}

          {/* Stock Status */}
          {selectedVariant && (
            <div className="text-sm">
              {selectedVariant.stock_status === 'instock' ? (
                <span className="text-green-600">✓ In Stock</span>
              ) : (
                <span className="text-red-600">✗ Out of Stock</span>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={(sizeOptions.length > 0 && !selectedSize) || (selectedVariant && selectedVariant.stock_status !== 'instock') || false}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant && selectedVariant.stock_status !== 'instock' 
                ? 'Out of Stock' 
                : 'Add to Cart'
              }
            </button>
            
            <div className="flex space-x-3">
              <WishlistButton product={product} className="flex-1" />
              <button className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 py-3 px-6 rounded-md hover:bg-gray-50">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Product Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="text-green-600" size={20} />
                <span className="text-sm">Free shipping on orders over ₹1500</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="text-green-600" size={20} />
                <span className="text-sm">Easy returns & exchanges</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="text-green-600" size={20} />
                <span className="text-sm">Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm
              productId={product.id}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        <ReviewDisplay
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={reviews.length}
        />
      </div>

      {/* Product Recommendations */}
      <ProductRecommendations 
        productId={product.id}
        type="similar"
        limit={4}
        title="You might also like"
      />
    </div>
  );
}
