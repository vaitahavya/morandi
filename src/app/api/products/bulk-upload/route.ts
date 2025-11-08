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

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // Handle both LF and CR line endings (including CRLF)
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the following LF in CRLF
      }
      lines.push(currentLine);
      currentLine = '';
      continue;
    }

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    }

    currentLine += char;
  }
  
  // Add last line
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  const normalizedLines = lines.filter(line => line.trim().length > 0);

  if (normalizedLines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(normalizedLines[0]).map(header =>
    header.replace(/^\uFEFF/, '').trim()
  );
  const products: any[] = [];

  // Parse rows
  for (let i = 1; i < normalizedLines.length; i++) {
    const values = parseCSVLine(normalizedLines[i]);
    if (values.length !== headers.length) continue;

    const product: any = {};
    headers.forEach((normalizedHeader, index) => {
      let value = values[index]?.trim() || '';
      
      // Parse based on field type
      if (normalizedHeader === 'regularPrice' || normalizedHeader === 'salePrice' || normalizedHeader === 'weight' || normalizedHeader === 'price') {
        product[normalizedHeader] = value ? parseFloat(value) : undefined;
      } else if (normalizedHeader === 'stockQuantity' || normalizedHeader === 'lowStockThreshold' || normalizedHeader === 'quantity') {
        product[normalizedHeader] = value ? parseInt(value) : undefined;
      } else if (normalizedHeader === 'manageStock' || normalizedHeader === 'trackQuantity' || normalizedHeader === 'featured' || normalizedHeader === 'allowBackorder') {
        product[normalizedHeader] = value === 'true' || value === '1';
      } else if (normalizedHeader === 'images') {
        // Handle multiple images separated by semicolon (comma conflicts with CSV delimiter)
        product[normalizedHeader] = value ? value.split(';').map((img: string) => img.trim()).filter(Boolean) : [];
      } else if (normalizedHeader === 'tags') {
        // Handle multiple tags separated by semicolon
        product[normalizedHeader] = value ? value.split(';').map((tag: string) => tag.trim()).filter(Boolean) : [];
      } else if (normalizedHeader === 'category' || normalizedHeader === 'categories') {
        // Store category names/IDs to resolve later
        product[normalizedHeader] = value ? value.split(';').map((cat: string) => cat.trim()).filter(Boolean) : [];
      } else {
        product[normalizedHeader] = value || undefined;
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

    const managesStock = product.manageStock ?? product.trackQuantity;
    if (managesStock === undefined) {
      product.manageStock = true;
      product.trackQuantity = true;
    } else {
      const normalized = managesStock === true || managesStock === 'true' || managesStock === 1 || managesStock === '1';
      product.manageStock = normalized;
      product.trackQuantity = normalized;
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

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      values.push(currentValue);
      currentValue = '';
      continue;
    }

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

  const managesStock = product.manageStock !== false && product.trackQuantity !== false;

  if (managesStock && product.stockQuantity !== undefined && product.stockQuantity < 0) {
    return { valid: false, error: 'Stock quantity cannot be negative' };
  }

  return { valid: true };
}

// Transform product data to match API format
async function transformProduct(product: any): Promise<any> {
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

  const images = Array.isArray(product.images)
    ? product.images
        .map((img: any) => {
          if (typeof img === 'string') return img.trim();
          if (img && typeof img === 'object') {
            return img.src || img.url || '';
          }
          return '';
        })
        .filter(Boolean)
    : [];

  const salePrice = product.salePrice ? parseFloat(product.salePrice.toString()) : undefined;
  const regularPrice = product.regularPrice ? parseFloat(product.regularPrice.toString()) : undefined;
  const resolvedPrice = product.price ? parseFloat(product.price.toString()) : salePrice || regularPrice || 0;
  const trackQuantity = product.manageStock !== false && product.trackQuantity !== false;
  const quantityValue = product.stockQuantity ?? product.quantity;

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    price: resolvedPrice,
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : regularPrice,
    regularPrice,
    salePrice,
    costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : undefined,
    trackQuantity,
    quantity: quantityValue !== undefined ? parseInt(quantityValue.toString()) : trackQuantity ? 0 : undefined,
    allowBackorder: product.allowBackorder === true || product.allowBackorder === 'true',
    weight: product.weight ? parseFloat(product.weight.toString()) : undefined,
    weightUnit: product.weightUnit,
    status: product.status || 'published',
    featured: product.featured === true || product.featured === 'true',
    tags: Array.isArray(product.tags) ? product.tags : [],
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images,
    featuredImage: product.featuredImage || images[0] || undefined,
    categoryIds,
    lowStockThreshold: product.lowStockThreshold !== undefined
      ? parseInt(product.lowStockThreshold.toString())
      : undefined,
  } as any;
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

