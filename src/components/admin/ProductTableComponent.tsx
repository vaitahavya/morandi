import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Package
} from 'lucide-react';

interface ProductTableComponentProps {
  products: any[];
  loading: boolean;
  selectedProducts: string[];
  onProductSelect: (productId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: string) => void;
  onViewProduct: (product: any) => void;
}

export function ProductTableComponent({
  products,
  loading,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  onEditProduct,
  onDeleteProduct,
  onViewProduct
}: ProductTableComponentProps) {
  const getStockStatusBadge = (product: any) => {
    if (product.stockStatus === 'outofstock') {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    }
    if (product.stockQuantity <= (product.lowStockThreshold || 5)) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Low Stock</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">In Stock</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="text-xs">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
      case 'private':
        return <Badge variant="outline" className="text-xs">Private</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categories
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                Loading products...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                No products found. Create your first product to get started.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => onProductSelect(product.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.featuredImage ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.featuredImage}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku || 'N/A'}
                      </div>
                      {product.featured && (
                        <Badge variant="default" className="text-xs mt-1">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getStockStatusBadge(product)}
                    <div className="text-xs text-gray-500">
                      Qty: {product.stockQuantity}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </div>
                  {product.salePrice && product.salePrice !== product.price && (
                    <div className="text-xs text-gray-500 line-through">
                      ₹{product.regularPrice?.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.slice(0, 2).map((category: any) => (
                      <Badge key={category.id} variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                    {product.categories && product.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProduct(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
