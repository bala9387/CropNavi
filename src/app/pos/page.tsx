'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag, Trash2, Plus, Minus, Search, Package, User,
  Sprout, Hammer, Droplets, Leaf, AlertCircle, TrendingUp, Sparkles,
  CheckCircle2, X, ChevronUp
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  description?: string;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const originalText = {
  'Point of Sale': 'Point of Sale',
  'Products': 'Products',
  'Search products...': 'Search products...',
  'Add': 'Add',
  'Cart': 'Cart',
  'Customer Name (optional)': 'Customer Name (optional)',
  'Remove': 'Remove',
  'Total': 'Total',
  'Process Sale': 'Process Sale',
  'Stock': 'Stock',
  'Insufficient stock': 'Insufficient stock',
  'Cart is empty': 'Cart is empty',
  'Sale processed successfully': 'Sale processed successfully',
  'Failed to fetch products': 'Failed to fetch products',
  'Failed to process sale': 'Failed to process sale',
  'All': 'All',
  'Receipt': 'Receipt',
  'Sale Complete': 'Sale Complete',
  'Close': 'Close',
  'Clear Cart': 'Clear Cart',
  'Items': 'Items',
  'Date': 'Date',
  'Transaction ID': 'Transaction ID',
  'No products found': 'No products found',
  'Subtotal': 'Subtotal',
  'Stock Limit': 'Stock Limit',
  'Manage sales and inventory efficiently': 'Manage sales and inventory efficiently',
  'Checkout': 'Checkout',
  'View Cart': 'View Cart',
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { toast } = useToast();
  const { translatedText, T } = useTranslation(originalText);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const { data } = await res.json();
      setProducts(data.filter((p: Product) => p.stock_quantity > 0));
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
      console.error(error);
    }
  };

  const addToCart = (product: Product) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        toast({
          variant: "destructive",
          title: "Stock Limit",
          description: translatedText['Insufficient stock'],
        });
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      toast({
        variant: "destructive",
        title: "Stock Limit",
        description: translatedText['Insufficient stock'],
      });
      return;
    }
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    const items = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.quantity * item.product.price
    }));

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: null,
          items,
          total_amount: totalAmount,
          notes: customerName ? `Customer: ${customerName}` : ''
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setLastSale(data);
        setShowReceipt(true);
        setIsMobileCartOpen(false); // Close mobile sheet if open
        setCart([]);
        setCustomerName('');
        fetchProducts();
        toast({
          title: "Success",
          description: translatedText['Sale processed successfully'],
        });
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
        description: translatedText['Failed to process sale'],
      });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('seed')) return <Leaf className="h-6 w-6" />;
    if (lower.includes('fert')) return <Droplets className="h-6 w-6" />;
    if (lower.includes('tool')) return <Hammer className="h-6 w-6" />;
    return <Sprout className="h-6 w-6" />;
  };

  const getCategoryGradient = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('seed')) return 'from-amber-100 to-orange-50 text-amber-700 border-amber-200';
    if (lower.includes('fert')) return 'from-cyan-100 to-blue-50 text-cyan-700 border-cyan-200';
    if (lower.includes('tool')) return 'from-gray-100 to-slate-50 text-slate-700 border-slate-200';
    return 'from-emerald-100 to-green-50 text-emerald-700 border-emerald-200';
  };

  // Cart Content Component (Reusable for Sidebar and Sheet)
  const CartContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> <T textKey="Cart" />
            </h2>
            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
              {cart.length} <T textKey="Items" />
            </div>
          </div>
          <div className="relative group w-full">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-primary-foreground transition-colors" />
            <Input
              placeholder={translatedText['Customer Name (optional)']}
              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/30 transition-all rounded-xl w-full"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50/50 relative">
        <ScrollArea className="h-full px-4 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[300px]">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 text-gray-300">
                <ShoppingBag className="h-16 w-16" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900"><T textKey="Cart is empty" /></h3>
                <p className="text-sm text-gray-500 mt-1">Start adding products to create a sale.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-20 md:pb-0"> {/* Padding bottom for mobile scrolling */}
              {cart.map((item) => (
                <div key={item.product.id} className="group flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">@ Rs. {item.product.price}</p>
                  </div>

                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all hover:text-red-500 active:scale-90" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all hover:text-green-600 active:scale-90" onClick={() => addToCart(item.product)}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-gray-900">Rs. {(item.quantity * item.product.price).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-col gap-4 p-4 md:p-6 bg-white border-t border-gray-100 relative z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] shrink-0">
        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span><T textKey="Subtotal" /></span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed border-gray-200"></div>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-gray-900"><T textKey="Total" /></span>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              Rs. {total.toFixed(0)}<span className="text-lg text-gray-400 font-medium">.{total.toFixed(2).split('.')[1]}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 w-full mt-2">
          <Button
            variant="outline"
            className="col-span-1 h-14 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            className="col-span-4 h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] transition-all bg-gradient-to-r from-gray-900 to-gray-800 hover:from-primary hover:to-green-600"
            onClick={processSale}
            disabled={cart.length === 0}
          >
            <T textKey="Process Sale" /> <CheckCircle2 className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1625246333195-58197bd47f3b?q=80&w=2070&auto=format&fit=crop')] bg-fixed bg-cover relative">
      {/* Background Overlay for Glassmorphism */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-0"></div>

      <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] flex flex-col gap-6 relative z-10 pb-24 md:pb-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md sticky top-0 md:relative z-30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"><T textKey="Point of Sale" /></h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium hidden md:block"><T textKey="Manage sales and inventory efficiently" /></p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex px-5 py-2 text-base bg-white/80 backdrop-blur border-gray-200 shadow-sm rounded-full">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">

          {/* Left Column: Products (8 cols) - Mobile optimized */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  placeholder={translatedText['Search products...']}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 md:h-12 bg-white/80 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl shadow-sm text-base md:text-lg"
                />
              </div>
            </div>

            <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start overflow-x-auto p-1.5 bg-gray-100/50 backdrop-blur rounded-xl border border-white/20 touch-none"> {/* touch-none to prevent drag interfering? NO, overflow-x uses touch. */}
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all rounded-lg px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
                  <T textKey="All" />
                </TabsTrigger>
                {categories.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id.toString()} className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all rounded-lg px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="flex-1 mt-4 pr-0 md:pr-2 -mr-0 md:-mr-2">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 md:p-16 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
                    <div className="h-20 w-20 md:h-24 md:w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 md:h-10 md:w-10 opacity-30" />
                    </div>
                    <p className="text-lg md:text-xl font-medium"><T textKey="No products found" /></p>
                    <Button variant="link" onClick={() => { setSearch(''); setSelectedCategory('all') }} className="mt-2 text-primary">Clear Filters</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-12 pt-1">
                    {filteredProducts.map((product) => {
                      const category = categories.find(c => c.id === product.category_id);
                      const catName = category ? category.name : 'General';
                      return (
                        <Card
                          key={product.id}
                          className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl md:rounded-2xl cursor-pointer active:scale-95"
                          onClick={() => addToCart(product)}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(catName).split(' ')[0]} ${getCategoryGradient(catName).split(' ')[1]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                          <CardHeader className="p-3 md:p-4 pb-2 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 md:mb-3 bg-gradient-to-br ${getCategoryGradient(catName)} shadow-inner transform group-hover:rotate-12 transition-transform duration-300`}>
                                {getCategoryIcon(catName)}
                              </div>
                              <div className="bg-white/90 backdrop-blur rounded-full px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-bold shadow-sm text-gray-600">
                                Stock: {product.stock_quantity}
                              </div>
                            </div>
                            <CardTitle className="text-sm md:text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2" title={product.name}>
                              {product.name}
                            </CardTitle>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">{catName}</p>
                          </CardHeader>

                          <CardContent className="p-3 md:p-4 pt-2 mt-auto relative z-10">
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-xl md:text-2xl font-extrabold text-gray-900 group-hover:scale-110 origin-left transition-transform duration-300">
                                  <span className="text-xs md:text-base font-medium text-gray-500 align-top mr-0.5">Rs.</span>{product.price}
                                </p>
                                {product.stock_quantity < 20 && (
                                  <div className="flex items-center gap-1 text-orange-600 text-[9px] md:text-[10px] font-bold mt-1 bg-orange-100 w-fit px-2 py-0.5 rounded-full animate-pulse">
                                    <AlertCircle className="h-3 w-3" /> Low Stock
                                  </div>
                                )}
                              </div>
                              <button className="h-8 w-8 md:h-10 md:w-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:scale-110">
                                <Plus className="h-5 w-5 md:h-6 md:w-6" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Column: Cart (4 cols) - Hidden on Mobile, Visible on LG */}
          <div className="hidden lg:col-span-4 lg:flex h-full min-h-0 flex-col">
            <Card className={`flex flex-col h-full border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-black/5 ${isAnimating ? 'scale-[1.01] ring-primary/50' : 'scale-100'} transition-transform duration-200`}>
              <CartContent />
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] z-50 lg:hidden safe-area-bottom">
        <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
          <SheetTrigger asChild>
            <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-center px-6 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {cart.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {cart.length}
                    </div>
                  )}
                </div>
                <span><T textKey="View Cart" /></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-normal">Total:</span>
                <span className="text-xl">Rs. {total.toFixed(0)}</span>
                <ChevronUp className="h-5 w-5 ml-1 animate-bounce" />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 border-0">
            <div className="h-full flex flex-col bg-gray-50/50">
              {/* Handle Bar */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 bg-gray-300 rounded-full"></div>
              </div>
              <CartContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl m-4 relative">
            {/* Zig Zag top pattern */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-green-400"></div>

            <div className="p-8 text-center bg-gray-50 border-b border-dashed border-gray-200">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-green-500 transform animate-bounce">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight"><T textKey="Sale Complete" /></h2>
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-1 font-mono text-sm">
                <span>ID: #{lastSale?.id}</span> • <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="p-8 space-y-6 bg-white relative">
              <div className="space-y-4">
                {lastSale?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {item.quantity}x
                      </div>
                      <span className="font-medium text-gray-700">Item {item.product_id}</span>
                    </div>
                    <span className="font-bold text-gray-900">Rs. {item.total_price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-100 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-500"><T textKey="Total" /></span>
                  <span className="font-black text-3xl text-primary">Rs. {lastSale?.total_amount?.toFixed(0)}</span>
                </div>
                <p className="text-center text-xs text-gray-300 mt-4 uppercase tracking-widest">Thank you for shopping</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <Button onClick={() => setShowReceipt(false)} variant="ghost" className="rounded-full w-12 h-12 p-0 hover:bg-gray-200 text-gray-500">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
