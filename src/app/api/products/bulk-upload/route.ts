import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { Product } from '@/lib/products-api';
import { prisma } from '@/lib/db';

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; product: string; error: string }>;
}

// Helper to parse CSV with proper quote handling
function parseCSV(csvText: string): any[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // Handle quoted fields that may contain newlines and commas
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      // End of line
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  // Add last line
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const products: any[] = [];

  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const product: any = {};
    headers.forEach((header, index) => {
      let value = values[index]?.trim() || '';
      
      // Parse based on field type
      if (header === 'regularPrice' || header === 'salePrice' || header === 'weight') {
        product[header] = value ? parseFloat(value) : undefined;
      } else if (header === 'stockQuantity' || header === 'lowStockThreshold') {
        product[header] = value ? parseInt(value) : undefined;
      } else if (header === 'manageStock' || header === 'featured') {
        product[header] = value === 'true' || value === '1';
      } else if (header === 'images') {
        // Handle multiple images separated by semicolon (comma conflicts with CSV delimiter)
        product[header] = value ? value.split(';').map((img: string) => img.trim()).filter(Boolean) : [];
      } else if (header === 'tags') {
        // Handle multiple tags separated by semicolon
        product[header] = value ? value.split(';').map((tag: string) => tag.trim()).filter(Boolean) : [];
      } else if (header === 'category' || header === 'categories') {
        // Store category names/IDs to resolve later
        product[header] = value ? value.split(';').map((cat: string) => cat.trim()).filter(Boolean) : [];
      } else {
        product[header] = value || undefined;
      }
    });

    // Set defaults and transform
    if (!product.slug && product.name) {
      product.slug = product.name
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }

    if (product.regularPrice && !product.price) {
      product.price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
    }

    if (!product.stockStatus) {
      product.stockStatus = 'instock';
    }

    if (product.manageStock === undefined) {
      product.manageStock = true;
    }

    if (!product.status) {
      product.status = 'published';
    }

    products.push(product);
  }

  return products;
}

// Helper to parse a CSV line, handling quoted fields
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add last value
  values.push(currentValue);

  return values;
}

// Helper to resolve category names to IDs
async function resolveCategoryIds(categoryNamesOrIds: string[]): Promise<string[]> {
  if (!categoryNamesOrIds || categoryNamesOrIds.length === 0) {
    return [];
  }

  const categoryIds: string[] = [];
  
  // Fetch all categories once for efficiency
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  });
  
  for (const nameOrId of categoryNamesOrIds) {
    // Try to find by ID first
    let category = allCategories.find(c => c.id === nameOrId);
    
    // If not found by ID, try to find by name or slug (case-insensitive)
    if (!category) {
      const normalizedSearch = nameOrId.trim().toLowerCase();
      category = allCategories.find(c => 
        c.name.toLowerCase() === normalizedSearch ||
        c.slug.toLowerCase() === normalizedSearch ||
        c.slug.toLowerCase() === normalizedSearch.replace(/\s+/g, '-')
      );
    }

    if (category) {
      categoryIds.push(category.id);
    }
  }

  return categoryIds;
}

// Helper to validate product data
function validateProduct(product: any, row: number): { valid: boolean; error?: string } {
  if (!product.name) {
    return { valid: false, error: 'Product name is required' };
  }

  if (!product.slug) {
    return { valid: false, error: 'Product slug is required' };
  }

  if (!product.regularPrice || product.regularPrice <= 0) {
    return { valid: false, error: 'Regular price must be greater than 0' };
  }

  if (product.salePrice && product.salePrice > product.regularPrice) {
    return { valid: false, error: 'Sale price cannot be greater than regular price' };
  }

  if (product.manageStock && product.stockQuantity !== undefined && product.stockQuantity < 0) {
    return { valid: false, error: 'Stock quantity cannot be negative' };
  }

  return { valid: true };
}

// Transform product data to match API format
async function transformProduct(product: any): Promise<Partial<Product>> {
  // Resolve categories (can be names or IDs)
  let categoryIds: string[] = [];
  if (product.selectedCategories && Array.isArray(product.selectedCategories)) {
    categoryIds = await resolveCategoryIds(product.selectedCategories);
  } else if (product.categoryIds && Array.isArray(product.categoryIds)) {
    categoryIds = await resolveCategoryIds(product.categoryIds);
  } else if (product.category || product.categories) {
    const categoryList = Array.isArray(product.category || product.categories) 
      ? (product.category || product.categories)
      : [(product.category || product.categories)];
    categoryIds = await resolveCategoryIds(categoryList);
  }

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    regularPrice: product.regularPrice,
    salePrice: product.salePrice,
    price: product.price || product.salePrice || product.regularPrice,
    stockQuantity: product.stockQuantity || 0,
    stockStatus: product.stockStatus || 'instock',
    manageStock: product.manageStock !== false,
    lowStockThreshold: product.lowStockThreshold || 5,
    weight: product.weight ? parseFloat(product.weight.toString()) : undefined,
    status: product.status || 'published',
    featured: product.featured === true || product.featured === 'true',
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images: product.images || [],
    featuredImage: product.featuredImage || product.images?.[0] || '',
    selectedCategories: categoryIds,
    tags: product.tags || []
  };
}

// POST /api/products/bulk-upload - Bulk upload products from CSV or JSON
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    let products: any[] = [];

    // Parse based on file type
    if (file.name.endsWith('.json') || file.type === 'application/json') {
      try {
        products = JSON.parse(text);
        if (!Array.isArray(products)) {
          return NextResponse.json(
            { success: false, error: 'JSON file must contain an array of products' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON format' },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      products = parseCSV(text);
      if (products.length === 0) {
        return NextResponse.json(
          { success: false, error: 'CSV file is empty or invalid' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Please use CSV or JSON' },
        { status: 400 }
      );
    }

    // Process products
    const result: BulkUploadResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process products in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (product, batchIndex) => {
          const row = i + batchIndex + 1; // +1 because CSV header is row 0

          // Validate product
          const validation = validateProduct(product, row);
          if (!validation.valid) {
            result.failed++;
            result.errors.push({
              row,
              product: product.name || `Row ${row}`,
              error: validation.error || 'Validation failed'
            });
            return;
          }

          try {
            // Transform product data (async because it resolves categories)
            const transformedProduct = await transformProduct(product);

            // Create product
            await productService.createProduct(transformedProduct);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              row,
              product: product.name || `Row ${row}`,
              error: error instanceof Error ? error.message : 'Failed to create product'
            });
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk upload'
      },
      { status: 500 }
    );
  }
}

