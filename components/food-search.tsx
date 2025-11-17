'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Barcode, Loader2, X } from 'lucide-react';
import { searchFoods, getFoodDetails, type FoodNutrition } from '@/lib/usda-api';
import { searchByBarcode, searchProducts } from '@/lib/barcode-api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface FoodSearchProps {
  onFoodSelect: (food: FoodNutrition) => void;
  placeholder?: string;
}

export function FoodSearch({ onFoodSelect, placeholder }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [results, setResults] = useState<FoodNutrition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try USDA first
      const usdaResults = await searchFoods(query, { pageSize: 10 });

      if (usdaResults.foods && usdaResults.foods.length > 0) {
        // Convert USDA foods to FoodNutrition format
        const foods = await Promise.all(
          usdaResults.foods.slice(0, 10).map(async (food) => {
            try {
              return await getFoodDetails(food.fdcId);
            } catch (err) {
              console.error('Error fetching food details:', err);
              return null;
            }
          })
        );

        setResults(foods.filter((f): f is FoodNutrition => f !== null));
      } else {
        // Fallback to Open Food Facts if USDA returns nothing
        const offResults = await searchProducts(query, 1, 10);
        setResults(offResults.products);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search foods. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const food = await searchByBarcode(barcodeInput.trim());

      if (food) {
        onFoodSelect(food);
        setBarcodeInput('');
        setShowBarcode(false);
      } else {
        setError('Product not found. Try searching by name instead.');
      }
    } catch (err) {
      console.error('Barcode search error:', err);
      setError('Failed to scan barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatServingSize = (food: FoodNutrition) => {
    if (!food.servingSize || !food.servingUnit) return '';
    return `${food.servingSize}${food.servingUnit}`;
  };

  const formatMacros = (food: FoodNutrition) => {
    const parts = [];
    if (food.calories) parts.push(`${Math.round(food.calories)} cal`);
    if (food.protein) parts.push(`${Math.round(food.protein)}g protein`);
    if (food.carbs) parts.push(`${Math.round(food.carbs)}g carbs`);
    if (food.fat) parts.push(`${Math.round(food.fat)}g fat`);
    return parts.join(' • ');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder={placeholder || "Search foods... (e.g., 'chicken breast')"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={() => setShowBarcode(!showBarcode)}
          variant="outline"
          className="flex-shrink-0"
        >
          <Barcode className="w-5 h-5" />
        </Button>
      </div>

      {/* Barcode Scanner */}
      {showBarcode && (
        <Card className="p-4 border-primary/20">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter barcode number..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              className="flex-1"
            />
            <Button onClick={handleBarcodeSearch} disabled={loading || !barcodeInput.trim()}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan'}
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-2">
            Enter a UPC, EAN-13, or EAN-8 barcode number
          </p>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && results.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-white/60">Searching foods...</span>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-white/60">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((food, index) => (
              <Card
                key={`${food.fdcId}-${index}`}
                className="p-4 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => {
                  onFoodSelect(food);
                  setSearchQuery('');
                  setResults([]);
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-white">
                        {food.description}
                      </h4>
                      {food.brandName && (
                        <p className="text-sm text-white/60">{food.brandName}</p>
                      )}
                    </div>
                    {formatServingSize(food) && (
                      <span className="text-sm text-white/60 flex-shrink-0">
                        {formatServingSize(food)}
                      </span>
                    )}
                  </div>

                  {formatMacros(food) && (
                    <p className="text-sm text-white/80">{formatMacros(food)}</p>
                  )}

                  {food.barcode && (
                    <p className="text-xs text-white/40">
                      <Barcode className="inline w-3 h-3 mr-1" />
                      {food.barcode}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchQuery.length >= 2 && results.length === 0 && !error && (
        <div className="text-center py-8 text-white/60">
          <p>No foods found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try a different search term or use the barcode scanner</p>
        </div>
      )}
    </div>
  );
}
