'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  FolderOpen,
  Folder,
  Search,
  Filter,
  MoreHorizontal,
  Save,
  X
} from 'lucide-react';
import { CategoryForm } from './CategoryForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  displayOrder: number;
  isVisible: boolean;
  metaTitle?: string;
  metaDescription?: string;
  productCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagerProps {
  initialCategories?: Category[];
}

export default function CategoryManager({ initialCategories = [] }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvisible, setShowInvisible] = useState(false);

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories?includeProductCount=true');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will remove all product associations.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadCategories();
        localStorage.setItem('categories-updated', Date.now().toString());
      } else {
        setError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_visible: !category.isVisible,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadCategories();
        localStorage.setItem('categories-updated', Date.now().toString());
      } else {
        setError(data.error || 'Failed to update category');
      }
    } catch (err) {
      setError('Failed to update category');
      console.error('Error updating category:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    loadCategories();
    // Notify other tabs that categories have been updated
    localStorage.setItem('categories-updated', Date.now().toString());
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = showInvisible || category.isVisible;
    return matchesSearch && matchesVisibility;
  });

  // Build category tree for display
  const buildCategoryTree = (categories: Category[], parentId?: string): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }));
  };

  const categoryTree = buildCategoryTree(filteredCategories);

  const renderCategoryRow = (category: Category, level = 0) => (
    <div key={category.id} className="space-y-2">
      <div 
        className={`flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow ${
          level > 0 ? 'ml-8 border-l-2 border-l-blue-200' : ''
        }`}
      >
        <div className="flex items-center space-x-4">
          {level > 0 && <div className="w-4" />}
          <div className="flex items-center space-x-2">
            {category.children && category.children.length > 0 ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium">{category.name}</span>
            {!category.isVisible && (
              <Badge variant="secondary" className="text-xs">
                Hidden
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {category.productCount || 0} products
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleVisibility(category)}
              title={category.isVisible ? 'Hide category' : 'Show category'}
            >
              {category.isVisible ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteCategory(category)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {category.children && category.children.map(child => renderCategoryRow(child, level + 1))}
    </div>
  );

  if (showForm) {
    return (
      <CategoryForm
        category={editingCategory}
        categories={categories}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories and organize your catalog</p>
        </div>
        <Button onClick={handleCreateCategory} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>
            <Button
              variant={showInvisible ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInvisible(!showInvisible)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Show Hidden</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
          <CardDescription>
            Manage your product categories. Drag to reorder or click to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No categories match your search criteria.' : 'Get started by creating your first category.'}
              </p>
              <Button onClick={handleCreateCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryTree.map(category => renderCategoryRow(category))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
