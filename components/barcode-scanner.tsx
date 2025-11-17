'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface BarcodeResult {
  name: string;
  brand: string;
  barcode: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  image: string | null;
  servingSize: string;
}

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/food/barcode?code=${encodeURIComponent(barcode)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      setResult(data.product);
    } catch (err: any) {
      setError(err.message || 'Failed to scan barcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Barcode Scanner</h2>
        <p className="text-white/60 mb-6">
          Scan or enter a barcode to get instant nutrition information
        </p>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter barcode (EAN-13, UPC, etc.)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {result.image && (
                  <img
                    src={result.image}
                    alt={result.name}
                    className="w-full h-48 object-contain rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-white mb-2">{result.name}</h3>
                {result.brand && (
                  <p className="text-white/60 mb-4">Brand: {result.brand}</p>
                )}
                <p className="text-sm text-white/40">Barcode: {result.barcode}</p>
                <p className="text-sm text-white/40">Serving Size: {result.servingSize}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Nutrition Facts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/80">Calories</span>
                    <span className="text-white font-bold">{result.nutrition.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Protein</span>
                    <span className="text-white font-bold">{result.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Carbs</span>
                    <span className="text-white font-bold">{result.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Fats</span>
                    <span className="text-white font-bold">{result.nutrition.fats}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Fiber</span>
                    <span className="text-white font-bold">{result.nutrition.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Sugar</span>
                    <span className="text-white font-bold">{result.nutrition.sugar}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Sodium</span>
                    <span className="text-white font-bold">{result.nutrition.sodium}mg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
