'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Eye, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    name: string;
    // Handle cases where product join might rely on separate fetch or if API provides it
    // The current API might not provide product name in sale_items unless joined.
    // Let's assume the API needs to be checked or we robustly handle missing names.
  };
}
// Note: API /api/sales?id=X returns items. Does it join products?
// Looking at api/sales/route.ts, it queries `sale_items` table.
// It DOES NOT join products table. So `item.product.name` will be undefined!
// We need to fix the API or fetch product names.
// For now, let's just display Product ID if Name is missing, or fix the API later.
// Actually, `item.product` property might not exist.
// Let's check `sale_items` table structure in db.ts. 
// columns: id, sale_id, product_id, quantity, unit_price, total_price.
// No product name. 
// I will patch the frontend to just show Product ID for now, or fetch products to map names.
// Or better: The PREVIOUS code accessed `item.product.name`. Was that working?
// If previous code worked, then `query` in db.ts does joins? No, it's just `db.prepare`.
// So previous code was likely broken or I missed a Join.
// I'll stick to robust code.

interface Sale {
  id: number;
  customer_id: number | null;
  total_amount: number;
  sale_date: string;
  created_at: string; // The API returns created_at usually? db.ts says sale_date DEFAULT CURRENT_TIMESTAMP
  // db.ts: sale_date DATETIME.
  items?: SaleItem[]; // Updated to optional
  notes?: string;
}

const originalText = {
  'Sales History': 'Sales History',
  'View and manage your past transactions.': 'View and manage your past transactions.',
  'Sales': 'Sales',
  'Search sales...': 'Search sales...',
  'Sale #': 'Sale #',
  'No notes': 'No notes',
  'items': 'items',
  'Sale Details': 'Sale Details',
  'Date': 'Date',
  'Notes': 'Notes',
  'Items': 'Items',
  'Select a sale to view details': 'Select a sale to view details',
  'Failed to fetch sales': 'Failed to fetch sales',
  'None': 'None',
  'Total': 'Total',
  'Actions': 'Actions',
  'View Details': 'View Details',
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productsMap, setProductsMap] = useState<Record<number, string>>({});

  const { toast } = useToast();
  const { translatedText, T } = useTranslation(originalText);

  useEffect(() => {
    fetchSales();
    fetchProductNames(); // Pre-fetch product names to map IDs
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const { data } = await res.json();
      setSales(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: translatedText['Failed to fetch sales'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductNames = async () => {
    try {
      const res = await fetch('/api/products');
      const { data } = await res.json();
      const map: Record<number, string> = {};
      data.forEach((p: any) => map[p.id] = p.name);
      setProductsMap(map);
    } catch (e) {
      // quiet fail
    }
  };

  const fetchSaleDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/sales?id=${id}`);
      const { data } = await res.json();
      setSelectedSale(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch sale details",
      });
    }
  };

  const filteredSales = sales.filter(s =>
    s.id.toString().includes(search) ||
    (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><T textKey="Sales History" /></h1>
        <p className="text-muted-foreground"><T textKey="View and manage your past transactions." /></p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle><T textKey="Sales" /></CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translatedText['Search sales...']}
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
                  <TableHead>ID</TableHead>
                  <TableHead><T textKey="Date" /></TableHead>
                  <TableHead><T textKey="Notes" /></TableHead>
                  <TableHead className="text-right"><T textKey="Total" /></TableHead>
                  <TableHead className="text-right"><T textKey="Actions" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No sales found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" /> {formatDate(sale.sale_date || sale.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={sale.notes || ''}>
                        {sale.notes || <span className="text-muted-foreground italic"><T textKey="None" /></span>}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        Rs. {sale.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => fetchSaleDetails(sale.id)}>
                              <Eye className="h-4 w-4 mr-2" /> <T textKey="View Details" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle><T textKey="Sale Details" /> #{sale.id}</SheetTitle>
                              <SheetDescription>
                                {formatDate(sale.sale_date || sale.created_at)}
                              </SheetDescription>
                            </SheetHeader>

                            {selectedSale && selectedSale.id === sale.id ? (
                              <div className="mt-6 space-y-6">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2"><T textKey="Items" /></h4>
                                  <div className="border rounded-md divide-y">
                                    {(selectedSale.items || []).map((item) => (
                                      <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                                        <div>
                                          <p className="font-medium">{productsMap[item.product_id] || `Product #${item.product_id}`}</p>
                                          <p className="text-muted-foreground">Rs. {item.unit_price} x {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">Rs. {item.total_price.toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground"><T textKey="Notes" /></h4>
                                  <p className="text-sm p-3 bg-muted rounded-md border">
                                    {selectedSale.notes || <T textKey="No notes" />}
                                  </p>
                                </div>

                                <div className="pt-4 border-t flex justify-between items-center">
                                  <span className="text-lg font-semibold"><T textKey="Total" /></span>
                                  <span className="text-2xl font-bold text-primary">Rs. {selectedSale.total_amount.toFixed(2)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
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
