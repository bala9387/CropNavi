'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';


interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const { data } = await res.json();
      setProducts(data.filter((p: Product) => p.stock_quantity > 0));
    } catch (error) {
      alert('Failed to fetch products');
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        alert('Insufficient stock');
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
      alert('Insufficient stock');
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

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
          customer_id: null, // Can be added if customer selected
          items,
          total_amount: totalAmount,
          notes: customerName ? `Customer: ${customerName}` : ''
        })
      });

      if (res.ok) {
        alert('Sale processed successfully');
        setCart([]);
        setCustomerName('');
        fetchProducts(); // Refresh stock
      } else {
        const { error } = await res.json();
        alert(error);
      }
    } catch (error) {
      alert('Failed to process sale');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-4 text-center">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-lg font-bold">₹{product.price}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                  <Button onClick={() => addToCart(product)} className="mt-2">Add</Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mb-4"
            />
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center mb-2 p-2 border rounded">
                <div>
                  <h4>{item.product.name}</h4>
                  <p>₹{item.product.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <h3 className="text-xl font-bold">Total: ₹{total.toFixed(2)}</h3>
              <Button onClick={processSale} className="w-full mt-4" disabled={cart.length === 0}>
                Process Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
