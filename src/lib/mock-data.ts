import { Product } from './products-api';

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-tshirt",
    price: 29.99,
    regularPrice: 39.99,
    salePrice: 29.99,
    description: "High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.",
    shortDescription: "Comfortable cotton t-shirt",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 100,
    featured: false,
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=60",
        alt: "Premium Cotton T-Shirt"
      },
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=400&q=60",
        alt: "Premium Cotton T-Shirt - Back View"
      }
    ],
    categories: [
      {
        id: "1",
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: "2",
        name: "T-Shirts",
        slug: "t-shirts"
      }
    ],
    attributes: {
      "Size": ["S", "M", "L", "XL"],
      "Color": ["White", "Black", "Navy", "Gray"]
    },
    tags: ["cotton", "t-shirt", "casual"],
    category: "clothing",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Denim Jeans",
    slug: "denim-jeans",
    price: 89.99,
    regularPrice: 89.99,
    salePrice: undefined,
    description: "Classic denim jeans with a modern fit. Durable and stylish for any occasion.",
    shortDescription: "Classic denim jeans",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 50,
    featured: false,
    images: [
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=60",
        alt: "Denim Jeans"
      },
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=60",
        alt: "Denim Jeans - Detail View"
      }
    ],
    categories: [
      {
        id: "1",
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: "3",
        name: "Jeans",
        slug: "jeans"
      }
    ],
    attributes: {
      "Size": ["30", "32", "34", "36", "38"],
      "Color": ["Blue", "Black", "Gray"]
    },
    tags: ["denim", "jeans", "casual"],
    category: "clothing",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Leather Sneakers",
    slug: "leather-sneakers",
    price: 129.99,
    regularPrice: 149.99,
    salePrice: 129.99,
    description: "Premium leather sneakers with comfortable cushioning. Perfect for both casual and formal wear.",
    shortDescription: "Premium leather sneakers",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 75,
    featured: true,
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=60",
        alt: "Leather Sneakers"
      },
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=60",
        alt: "Leather Sneakers - Side View"
      }
    ],
    categories: [
      {
        id: "4",
        name: "Footwear",
        slug: "footwear"
      },
      {
        id: "5",
        name: "Sneakers",
        slug: "sneakers"
      }
    ],
    attributes: {
      "Size": ["7", "8", "9", "10", "11", "12"],
      "Color": ["White", "Black", "Brown"]
    },
    tags: ["leather", "sneakers", "footwear"],
    category: "footwear",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Wool Sweater",
    slug: "wool-sweater",
    price: 79.99,
    regularPrice: 79.99,
    salePrice: undefined,
    description: "Warm and cozy wool sweater perfect for cold weather. Available in multiple colors.",
    shortDescription: "Warm wool sweater",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 60,
    featured: false,
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=60",
        alt: "Wool Sweater"
      },
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=60",
        alt: "Wool Sweater - Detail View"
      }
    ],
    categories: [
      {
        id: "1",
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: "6",
        name: "Sweaters",
        slug: "sweaters"
      }
    ],
    attributes: {
      "Size": ["S", "M", "L", "XL"],
      "Color": ["Navy", "Gray", "Burgundy", "Cream"]
    },
    tags: ["wool", "sweater", "warm"],
    category: "clothing",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Canvas Backpack",
    slug: "canvas-backpack",
    price: 59.99,
    regularPrice: 69.99,
    salePrice: 59.99,
    description: "Durable canvas backpack with multiple compartments. Perfect for everyday use.",
    shortDescription: "Durable canvas backpack",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 40,
    featured: false,
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=60",
        alt: "Canvas Backpack"
      },
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=60",
        alt: "Canvas Backpack - Interior View"
      }
    ],
    categories: [
      {
        id: "7",
        name: "Accessories",
        slug: "accessories"
      },
      {
        id: "8",
        name: "Bags",
        slug: "bags"
      }
    ],
    attributes: {
      "Color": ["Khaki", "Olive", "Navy", "Black"]
    },
    tags: ["canvas", "backpack", "accessories"],
    category: "accessories",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "6",
    name: "Silk Scarf",
    slug: "silk-scarf",
    price: 39.99,
    regularPrice: 39.99,
    salePrice: undefined,
    description: "Elegant silk scarf with beautiful patterns. Perfect accessory for any outfit.",
    shortDescription: "Elegant silk scarf",
    stockStatus: "instock",
    inStock: true,
    stockQuantity: 80,
    featured: false,
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=60",
        alt: "Silk Scarf"
      },
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=60",
        alt: "Silk Scarf - Pattern Detail"
      }
    ],
    categories: [
      {
        id: "7",
        name: "Accessories",
        slug: "accessories"
      },
      {
        id: "9",
        name: "Scarves",
        slug: "scarves"
      }
    ],
    attributes: {
      "Color": ["Red", "Blue", "Green", "Purple", "Orange"]
    },
    tags: ["silk", "scarf", "accessories"],
    category: "accessories",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]; 