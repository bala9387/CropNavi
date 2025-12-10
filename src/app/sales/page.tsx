'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Sale {
  id: number;
  customer_id: number | null;
  total_amount: number;
  notes: string;
  created_at: string;
  sale_items: SaleItem[];
}

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    name: string;
  };
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const { data } = await res.json();
      setSales(data);
    } catch (error) {
      alert('Failed to fetch sales');
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.id.toString().includes(search) ||
    sale.notes.toLowerCase().includes(search.toLowerCase()) ||
    sale.total_amount.toString().includes(search)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Sales History</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedSale?.id === sale.id ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => setSelectedSale(sale)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Sale #{sale.id}</h4>
                      <p className="text-sm text-gray-600">{formatDate(sale.created_at)}</p>
                      <p className="text-sm">{sale.notes || 'No notes'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{sale.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{sale.sale_items.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sale Details */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSale ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Sale #{selectedSale.id}</h3>
                  <p className="text-sm text-gray-600">Date: {formatDate(selectedSale.created_at)}</p>
                  <p className="text-sm">Notes: {selectedSale.notes || 'None'}</p>
                  <p className="text-lg font-bold mt-2">Total: ₹{selectedSale.total_amount.toFixed(2)}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-2">
                    {selectedSale.sale_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <h5 className="font-medium">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">₹{item.unit_price} x {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a sale to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
