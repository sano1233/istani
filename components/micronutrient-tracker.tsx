'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MicronutrientData {
  // Vitamins
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB5?: number;
  vitaminB6?: number;
  vitaminB7?: number;
  vitaminB9?: number;
  vitaminB12?: number;

  // Minerals
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  chromium?: number;
  molybdenum?: number;
  iodine?: number;
}

// Daily recommended values (adults)
const DRV: Record<keyof MicronutrientData, { value: number; unit: string; name: string }> = {
  // Vitamins
  vitaminA: { value: 900, unit: 'mcg', name: 'Vitamin A' },
  vitaminC: { value: 90, unit: 'mg', name: 'Vitamin C' },
  vitaminD: { value: 20, unit: 'mcg', name: 'Vitamin D' },
  vitaminE: { value: 15, unit: 'mg', name: 'Vitamin E' },
  vitaminK: { value: 120, unit: 'mcg', name: 'Vitamin K' },
  vitaminB1: { value: 1.2, unit: 'mg', name: 'Thiamin (B1)' },
  vitaminB2: { value: 1.3, unit: 'mg', name: 'Riboflavin (B2)' },
  vitaminB3: { value: 16, unit: 'mg', name: 'Niacin (B3)' },
  vitaminB5: { value: 5, unit: 'mg', name: 'Pantothenic Acid (B5)' },
  vitaminB6: { value: 1.7, unit: 'mg', name: 'Vitamin B6' },
  vitaminB7: { value: 30, unit: 'mcg', name: 'Biotin (B7)' },
  vitaminB9: { value: 400, unit: 'mcg', name: 'Folate (B9)' },
  vitaminB12: { value: 2.4, unit: 'mcg', name: 'Vitamin B12' },

  // Minerals
  calcium: { value: 1000, unit: 'mg', name: 'Calcium' },
  iron: { value: 18, unit: 'mg', name: 'Iron' },
  magnesium: { value: 400, unit: 'mg', name: 'Magnesium' },
  phosphorus: { value: 700, unit: 'mg', name: 'Phosphorus' },
  potassium: { value: 3500, unit: 'mg', name: 'Potassium' },
  sodium: { value: 2300, unit: 'mg', name: 'Sodium' },
  zinc: { value: 11, unit: 'mg', name: 'Zinc' },
  copper: { value: 0.9, unit: 'mg', name: 'Copper' },
  manganese: { value: 2.3, unit: 'mg', name: 'Manganese' },
  selenium: { value: 55, unit: 'mcg', name: 'Selenium' },
  chromium: { value: 35, unit: 'mcg', name: 'Chromium' },
  molybdenum: { value: 45, unit: 'mcg', name: 'Molybdenum' },
  iodine: { value: 150, unit: 'mcg', name: 'Iodine' },
};

interface MicronutrientTrackerProps {
  data: MicronutrientData;
  showPercentages?: boolean;
}

export function MicronutrientTracker({ data, showPercentages = true }: MicronutrientTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vitamins' | 'minerals'>('all');

  const getNutrientStatus = (value: number, drv: number) => {
    const percentage = (value / drv) * 100;
    if (percentage >= 100) return 'complete';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'fair';
    return 'low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const renderNutrient = (key: keyof MicronutrientData) => {
    const value = data[key];
    if (value === undefined || value === 0) return null;

    const drv = DRV[key];
    const percentage = Math.min((value / drv.value) * 100, 100);
    const status = getNutrientStatus(value, drv.value);

    return (
      <div key={key} className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{drv.name}</span>
          <span className="text-muted-foreground">
            {value.toFixed(1)} {drv.unit} {showPercentages && `(${percentage.toFixed(0)}%)`}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };

  const vitamins = Object.keys(DRV).filter(key => key.startsWith('vitamin')) as Array<keyof MicronutrientData>;
  const minerals = Object.keys(DRV).filter(key => !key.startsWith('vitamin')) as Array<keyof MicronutrientData>;

  const filteredNutrients = selectedCategory === 'all'
    ? [...vitamins, ...minerals]
    : selectedCategory === 'vitamins'
    ? vitamins
    : minerals;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Micronutrient Tracking</CardTitle>
        <CardDescription>
          Daily vitamin and mineral intake vs. recommended values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('vitamins')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'vitamins'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Vitamins
          </button>
          <button
            onClick={() => setSelectedCategory('minerals')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'minerals'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Minerals
          </button>
        </div>

        <div className="space-y-4">
          {filteredNutrients.map(renderNutrient)}
        </div>

        {filteredNutrients.filter(key => data[key] !== undefined && data[key] !== 0).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No micronutrient data available yet. Start logging meals with detailed nutrition info!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MicronutrientTracker;
