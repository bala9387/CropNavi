'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

const originalText = {
  'Product Management': 'Product Management',
  'Manage your inventory, pricing, and stock levels.': 'Manage your inventory, pricing, and stock levels.',
  'Edit Product': 'Edit Product',
  'Add New Product': 'Add New Product',
  'Product Name': 'Product Name',
  'Description': 'Description',
  'Price': 'Price',
  'Stock Quantity': 'Stock Quantity',
  'Select Category': 'Select Category',
  'Update': 'Update',
  'Create': 'Create',
  'Cancel': 'Cancel',
  'Products': 'Products',
  'Search products...': 'Search products...',
  'Edit': 'Edit',
  'Delete': 'Delete',
  'Failed to fetch products': 'Failed to fetch products',
  'Failed to fetch categories': 'Failed to fetch categories',
  'Product updated successfully': 'Product updated successfully',
  'Product created successfully': 'Product created successfully',
  'Failed to save product': 'Failed to save product',
  'Are you sure you want to delete this product?': 'Are you sure you want to delete this product?',
  'This action cannot be undone.': 'This action cannot be undone.',
  'Product deleted successfully': 'Product deleted successfully',
  'Failed to delete product': 'Failed to delete product',
  'Stock': 'Stock',
  'Actions': 'Actions',
  'Loading...': 'Loading...',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: ''
  });

  const { toast } = useToast();
  const { translatedText, T } = useTranslation(originalText);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()])
      .finally(() => setIsLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const { data } = await res.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: translatedText['Failed to fetch products'],
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const { data } = await res.json();
      setCategories(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: translatedText['Failed to fetch categories'],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: parseInt(formData.category_id)
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: editingProduct ? translatedText['Product updated successfully'] : translatedText['Product created successfully'],
        });
        fetchProducts();
        handleCloseDialog();
      } else {
        const { error } = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: translatedText['Failed to save product'],
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({
          title: "Deleted",
          description: translatedText['Product deleted successfully'],
        });
        fetchProducts();
      } else {
        const { error } = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: translatedText['Failed to delete product'],
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: ''
    });
    setEditingProduct(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id !== null ? product.category_id.toString() : ''
    });
    setIsDialogOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><T textKey="Product Management" /></h1>
          <p className="text-muted-foreground"><T textKey="Manage your inventory, pricing, and stock levels." /></p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)} className="gap-2">
              <Plus className="h-4 w-4" /> <T textKey="Add New Product" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? <T textKey="Edit Product" /> : <T textKey="Add New Product" />}</DialogTitle>
              <DialogDescription>
                <T textKey="Manage your inventory, pricing, and stock levels." />
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  placeholder={translatedText['Product Name']}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={translatedText['Description']}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder={translatedText['Price']}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder={translatedText['Stock Quantity']}
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </div>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translatedText['Select Category']} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}><T textKey="Cancel" /></Button>
                <Button type="submit">{editingProduct ? <T textKey="Update" /> : <T textKey="Create" />}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle><T textKey="Products" /></CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translatedText['Search products...']}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><T textKey="Product Name" /></TableHead>
                  <TableHead className="hidden md:table-cell"><T textKey="Description" /></TableHead>
                  <TableHead><T textKey="Price" /></TableHead>
                  <TableHead><T textKey="Stock" /></TableHead>
                  <TableHead className="text-right"><T textKey="Actions" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{product.description || '-'}</TableCell>
                      <TableCell>Rs. {product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock_quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle><T textKey="Are you sure you want to delete this product?" /></AlertDialogTitle>
                                <AlertDialogDescription>
                                  <T textKey="This action cannot be undone." />
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel><T textKey="Cancel" /></AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600">
                                  <T textKey="Delete" />
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
