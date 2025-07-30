import { Product } from './wordpress-api';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-tshirt",
    price: "29.99",
    regular_price: "39.99",
    sale_price: "29.99",
    description: "High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.",
    short_description: "Comfortable cotton t-shirt",
    stock_status: "instock",
    in_stock: true,
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
        id: 1,
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: 2,
        name: "T-Shirts",
        slug: "t-shirts"
      }
    ],
    attributes: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL"]
      },
      {
        name: "Color",
        options: ["White", "Black", "Navy", "Gray"]
      }
    ]
  },
  {
    id: 2,
    name: "Denim Jeans",
    slug: "denim-jeans",
    price: "89.99",
    regular_price: "89.99",
    sale_price: "",
    description: "Classic denim jeans with a modern fit. Durable and stylish for any occasion.",
    short_description: "Classic denim jeans",
    stock_status: "instock",
    in_stock: true,
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
        id: 1,
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: 3,
        name: "Jeans",
        slug: "jeans"
      }
    ],
    attributes: [
      {
        name: "Size",
        options: ["30", "32", "34", "36", "38"]
      },
      {
        name: "Color",
        options: ["Blue", "Black", "Gray"]
      }
    ]
  },
  {
    id: 3,
    name: "Leather Sneakers",
    slug: "leather-sneakers",
    price: "129.99",
    regular_price: "149.99",
    sale_price: "129.99",
    description: "Premium leather sneakers with comfortable cushioning. Perfect for both casual and formal wear.",
    short_description: "Premium leather sneakers",
    stock_status: "instock",
    in_stock: true,
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
        id: 4,
        name: "Footwear",
        slug: "footwear"
      },
      {
        id: 5,
        name: "Sneakers",
        slug: "sneakers"
      }
    ],
    attributes: [
      {
        name: "Size",
        options: ["7", "8", "9", "10", "11", "12"]
      },
      {
        name: "Color",
        options: ["White", "Black", "Brown"]
      }
    ]
  },
  {
    id: 4,
    name: "Wool Sweater",
    slug: "wool-sweater",
    price: "79.99",
    regular_price: "79.99",
    sale_price: "",
    description: "Warm and cozy wool sweater perfect for cold weather. Available in multiple colors.",
    short_description: "Warm wool sweater",
    stock_status: "instock",
    in_stock: true,
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
        id: 1,
        name: "Clothing",
        slug: "clothing"
      },
      {
        id: 6,
        name: "Sweaters",
        slug: "sweaters"
      }
    ],
    attributes: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL"]
      },
      {
        name: "Color",
        options: ["Navy", "Gray", "Burgundy", "Cream"]
      }
    ]
  },
  {
    id: 5,
    name: "Canvas Backpack",
    slug: "canvas-backpack",
    price: "59.99",
    regular_price: "69.99",
    sale_price: "59.99",
    description: "Durable canvas backpack with multiple compartments. Perfect for everyday use.",
    short_description: "Durable canvas backpack",
    stock_status: "instock",
    in_stock: true,
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
        id: 7,
        name: "Accessories",
        slug: "accessories"
      },
      {
        id: 8,
        name: "Bags",
        slug: "bags"
      }
    ],
    attributes: [
      {
        name: "Color",
        options: ["Khaki", "Olive", "Navy", "Black"]
      }
    ]
  },
  {
    id: 6,
    name: "Silk Scarf",
    slug: "silk-scarf",
    price: "39.99",
    regular_price: "39.99",
    sale_price: "",
    description: "Elegant silk scarf with beautiful patterns. Perfect accessory for any outfit.",
    short_description: "Elegant silk scarf",
    stock_status: "instock",
    in_stock: true,
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
        id: 7,
        name: "Accessories",
        slug: "accessories"
      },
      {
        id: 9,
        name: "Scarves",
        slug: "scarves"
      }
    ],
    attributes: [
      {
        name: "Color",
        options: ["Red", "Blue", "Green", "Purple", "Orange"]
      }
    ]
  }
]; 