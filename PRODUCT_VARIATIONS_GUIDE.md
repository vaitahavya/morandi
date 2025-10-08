# Product Variations Feature Guide

## Overview
The product variations feature allows you to create different variants of a product with unique attributes like size, color, material, etc. Each variation can have its own price, stock quantity, and attributes.

## Features Implemented

### 1. Admin Panel - Product Form
- **Add Variations Section**: New card in the product form to manage variations
- **Quick Actions**:
  - "Generate Matrix" button: Creates 16 variations (4 sizes × 4 colors) automatically
  - "Add One" button: Add individual variations one at a time
  
### 2. Variation Fields
Each variation can have:
- **Name**: Display name (e.g., "Red - Large")
- **SKU**: Unique stock keeping unit for this variation
- **Attributes**: Key-value pairs (e.g., Color: Red, Size: Large)
- **Pricing**:
  - Regular Price
  - Sale Price
  - Effective Price (automatically calculated)
- **Inventory**:
  - Stock Quantity
  - Stock Status (In Stock, Out of Stock, On Backorder)

### 3. Frontend Display
The product detail page already supports variations:
- Color selector (if variations have color attributes)
- Size selector (if variations have size attributes)
- Dynamic price updates based on selected variation
- Stock status per variation

## How to Use

### Creating a Product with Variations

1. **Go to Admin Panel** → Products → Add New Product
2. Fill in basic product information (name, description, base price)
3. Scroll to the **Product Variations** section
4. Choose one of two options:

   **Option A: Quick Matrix Generation**
   - Click "Generate Matrix" button
   - This creates 16 variations:
     - Colors: Black, White, Red, Blue
     - Sizes: S, M, L, XL
   - Each variation is automatically named (e.g., "Black - S")
   - SKUs are auto-generated based on the main product SKU
   - Edit as needed (change prices, stock quantities, etc.)

   **Option B: Manual Addition**
   - Click "Add One" button
   - Fill in variation details:
     - Name
     - SKU (optional)
   - Click "Add Attribute" to add properties:
     - Attribute name (e.g., "Color")
     - Attribute value (e.g., "Red")
   - Set pricing and stock information
   - Repeat for each variation

5. **Save the Product**

### Editing Variations

1. Open an existing product in the admin panel
2. Scroll to Product Variations section
3. Edit any variation:
   - Modify name, SKU, or attributes
   - Update pricing
   - Change stock levels
4. Delete variations by clicking the trash icon
5. Add more variations using "Add One" button
6. Save changes

### Frontend Behavior

When customers view a product with variations:

1. **Selectors Appear**: If variations have Color or Size attributes, selector buttons appear
2. **Price Updates**: Price changes when a variation is selected
3. **Stock Check**: "Add to Cart" is disabled if selected variation is out of stock
4. **Cart Integration**: Selected variation is added to cart with proper tracking

## Technical Details

### Database Schema
Variations are stored in the `ProductVariant` table with:
- Relation to parent `Product`
- Attributes stored as JSON string
- Individual pricing and stock management
- Cascade delete (deleting product deletes all variants)

### API Changes
- **POST /api/products**: Accepts `variants` array in request body
- **PUT /api/products/[id]**: Updates variants (replaces all existing)
- **GET /api/products/[id]**: Returns product with parsed variants

### Data Flow
1. **Admin Form** → Submits variants array
2. **ProductRepository** → Parses and stores in database
3. **API Response** → Converts JSON strings back to objects
4. **Frontend** → Displays selectors and manages state

## Example Usage

### Creating a T-Shirt Product

```javascript
{
  name: "Cotton T-Shirt",
  sku: "TSHIRT-001",
  price: 499,
  regularPrice: 499,
  variants: [
    {
      name: "Black - Small",
      sku: "TSHIRT-001-BL-S",
      price: 499,
      regularPrice: 499,
      stockQuantity: 10,
      stockStatus: "instock",
      attributes: [
        { name: "Color", value: "Black" },
        { name: "Size", value: "S" }
      ]
    },
    {
      name: "Red - Large",
      sku: "TSHIRT-001-RE-L",
      price: 549,
      regularPrice: 599,
      salePrice: 549,
      stockQuantity: 5,
      stockStatus: "instock",
      attributes: [
        { name: "Color", value: "Red" },
        { name: "Size", value: "L" }
      ]
    }
  ]
}
```

## Best Practices

1. **Consistent Naming**: Use a consistent format like "Color - Size"
2. **SKU Convention**: Base SKU + Color Code + Size Code (e.g., TSHIRT-001-BL-S)
3. **Attribute Names**: Use standard names ("Color", "Size", not "Colour", "size")
4. **Stock Management**: Keep stock quantities accurate for each variation
5. **Pricing Strategy**: 
   - Set base price on main product
   - Only change variation prices if they differ
   - Use sale prices for promotional pricing per variation

## Tips & Tricks

- **Bulk Creation**: Use "Generate Matrix" then edit prices/stock in bulk
- **Custom Attributes**: Not limited to Color/Size - use Material, Pattern, etc.
- **Empty Variations**: Delete unused variations before saving
- **Frontend Testing**: Always test variation selection on product page
- **Stock Alerts**: Monitor low stock variations from admin dashboard

## Troubleshooting

**Q: Variations not showing on product page?**
- Ensure attributes are named "Color" or "Size" (case-insensitive)
- Check that variations are saved with the product

**Q: Price not updating when selecting variation?**
- Verify each variation has a price set
- Clear browser cache and refresh

**Q: Can't add to cart?**
- Check if variation is in stock
- Ensure stock status is "instock"

**Q: SKU conflicts?**
- Each variation SKU must be unique across all products
- Use product SKU as prefix for variation SKUs

## Future Enhancements

Potential improvements:
- Bulk import variations from CSV
- Variation images per color
- Inventory tracking per variation
- Sales reports by variation
- Low stock alerts per variation

