'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { DAILY_VALUES, calculateDailyValuePercent } from '@/lib/usda-api';

interface MicronutrientData {
  // Vitamins
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_e_mg: number;
  vitamin_k_mcg: number;
  thiamin_b1_mg: number;
  riboflavin_b2_mg: number;
  niacin_b3_mg: number;
  vitamin_b6_mg: number;
  folate_mcg: number;
  vitamin_b12_mcg: number;
  choline_mg: number;

  // Minerals
  calcium_mg: number;
  iron_mg: number;
  magnesium_mg: number;
  phosphorus_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  zinc_mg: number;
  copper_mg: number;
  selenium_mcg: number;
  manganese_mg: number;

  // Other
  omega3_g: number;
  fiber_g: number;
  sugar_g: number;
}

interface NutrientInfo {
  name: string;
  value: number;
  unit: string;
  dv: number;
  category: 'vitamin' | 'mineral' | 'other';
  key: keyof MicronutrientData;
}

export function MicronutrientPanel() {
  const [data, setData] = useState<MicronutrientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vitamin' | 'mineral' | 'other'>('all');

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMicronutrients();
  }, []);

  const fetchMicronutrients = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: microData, error } = await supabase
        .from('micronutrient_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      setData(microData || createEmptyData());
    } catch (error) {
      console.error('Error fetching micronutrients:', error);
      setData(createEmptyData());
    } finally {
      setLoading(false);
    }
  };

  const createEmptyData = (): MicronutrientData => ({
    vitamin_a_mcg: 0,
    vitamin_c_mg: 0,
    vitamin_d_mcg: 0,
    vitamin_e_mg: 0,
    vitamin_k_mcg: 0,
    thiamin_b1_mg: 0,
    riboflavin_b2_mg: 0,
    niacin_b3_mg: 0,
    vitamin_b6_mg: 0,
    folate_mcg: 0,
    vitamin_b12_mcg: 0,
    choline_mg: 0,
    calcium_mg: 0,
    iron_mg: 0,
    magnesium_mg: 0,
    phosphorus_mg: 0,
    potassium_mg: 0,
    sodium_mg: 0,
    zinc_mg: 0,
    copper_mg: 0,
    selenium_mcg: 0,
    manganese_mg: 0,
    omega3_g: 0,
    fiber_g: 0,
    sugar_g: 0,
  });

  const nutrients: NutrientInfo[] = [
    // Vitamins
    { name: 'Vitamin A', value: data?.vitamin_a_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.vitaminA || 900, category: 'vitamin', key: 'vitamin_a_mcg' },
    { name: 'Vitamin C', value: data?.vitamin_c_mg || 0, unit: 'mg', dv: DAILY_VALUES.vitaminC || 90, category: 'vitamin', key: 'vitamin_c_mg' },
    { name: 'Vitamin D', value: data?.vitamin_d_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.vitaminD || 20, category: 'vitamin', key: 'vitamin_d_mcg' },
    { name: 'Vitamin E', value: data?.vitamin_e_mg || 0, unit: 'mg', dv: DAILY_VALUES.vitaminE || 15, category: 'vitamin', key: 'vitamin_e_mg' },
    { name: 'Vitamin K', value: data?.vitamin_k_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.vitaminK || 120, category: 'vitamin', key: 'vitamin_k_mcg' },
    { name: 'Thiamin (B1)', value: data?.thiamin_b1_mg || 0, unit: 'mg', dv: DAILY_VALUES.thiamin || 1.2, category: 'vitamin', key: 'thiamin_b1_mg' },
    { name: 'Riboflavin (B2)', value: data?.riboflavin_b2_mg || 0, unit: 'mg', dv: DAILY_VALUES.riboflavin || 1.3, category: 'vitamin', key: 'riboflavin_b2_mg' },
    { name: 'Niacin (B3)', value: data?.niacin_b3_mg || 0, unit: 'mg', dv: DAILY_VALUES.niacin || 16, category: 'vitamin', key: 'niacin_b3_mg' },
    { name: 'Vitamin B6', value: data?.vitamin_b6_mg || 0, unit: 'mg', dv: DAILY_VALUES.vitaminB6 || 1.7, category: 'vitamin', key: 'vitamin_b6_mg' },
    { name: 'Folate (B9)', value: data?.folate_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.folate || 400, category: 'vitamin', key: 'folate_mcg' },
    { name: 'Vitamin B12', value: data?.vitamin_b12_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.vitaminB12 || 2.4, category: 'vitamin', key: 'vitamin_b12_mcg' },
    { name: 'Choline', value: data?.choline_mg || 0, unit: 'mg', dv: DAILY_VALUES.choline || 550, category: 'vitamin', key: 'choline_mg' },

    // Minerals
    { name: 'Calcium', value: data?.calcium_mg || 0, unit: 'mg', dv: DAILY_VALUES.calcium || 1300, category: 'mineral', key: 'calcium_mg' },
    { name: 'Iron', value: data?.iron_mg || 0, unit: 'mg', dv: DAILY_VALUES.iron || 18, category: 'mineral', key: 'iron_mg' },
    { name: 'Magnesium', value: data?.magnesium_mg || 0, unit: 'mg', dv: DAILY_VALUES.magnesium || 420, category: 'mineral', key: 'magnesium_mg' },
    { name: 'Phosphorus', value: data?.phosphorus_mg || 0, unit: 'mg', dv: DAILY_VALUES.phosphorus || 1250, category: 'mineral', key: 'phosphorus_mg' },
    { name: 'Potassium', value: data?.potassium_mg || 0, unit: 'mg', dv: DAILY_VALUES.potassium || 4700, category: 'mineral', key: 'potassium_mg' },
    { name: 'Sodium', value: data?.sodium_mg || 0, unit: 'mg', dv: DAILY_VALUES.sodium || 2300, category: 'mineral', key: 'sodium_mg' },
    { name: 'Zinc', value: data?.zinc_mg || 0, unit: 'mg', dv: DAILY_VALUES.zinc || 11, category: 'mineral', key: 'zinc_mg' },
    { name: 'Copper', value: data?.copper_mg || 0, unit: 'mg', dv: DAILY_VALUES.copper || 0.9, category: 'mineral', key: 'copper_mg' },
    { name: 'Selenium', value: data?.selenium_mcg || 0, unit: 'mcg', dv: DAILY_VALUES.selenium || 55, category: 'mineral', key: 'selenium_mcg' },
    { name: 'Manganese', value: data?.manganese_mg || 0, unit: 'mg', dv: DAILY_VALUES.manganese || 2.3, category: 'mineral', key: 'manganese_mg' },

    // Other
    { name: 'Omega-3', value: data?.omega3_g || 0, unit: 'g', dv: DAILY_VALUES.omega3 || 1.6, category: 'other', key: 'omega3_g' },
    { name: 'Fiber', value: data?.fiber_g || 0, unit: 'g', dv: DAILY_VALUES.fiber || 28, category: 'other', key: 'fiber_g' },
    { name: 'Sugar', value: data?.sugar_g || 0, unit: 'g', dv: DAILY_VALUES.sugar || 50, category: 'other', key: 'sugar_g' },
  ];

  const filteredNutrients = selectedCategory === 'all'
    ? nutrients
    : nutrients.filter(n => n.category === selectedCategory);

  const getStatusColor = (percent: number, isSodium: boolean = false, isSugar: boolean = false) => {
    // For sodium and sugar, lower is better
    if (isSodium || isSugar) {
      if (percent > 100) return 'text-red-400';
      if (percent > 80) return 'text-yellow-400';
      return 'text-green-400';
    }

    // For other nutrients, higher is better (up to 100%)
    if (percent >= 100) return 'text-green-400';
    if (percent >= 75) return 'text-yellow-400';
    if (percent >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (percent: number, isSodium: boolean = false, isSugar: boolean = false) => {
    if (isSodium || isSugar) {
      if (percent > 100) return 'bg-red-500';
      if (percent > 80) return 'bg-yellow-500';
      return 'bg-green-500';
    }

    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Micronutrients
          </h3>
          <p className="text-sm text-white/60 mt-1">Today's intake vs. Daily Values</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'vitamin', 'mineral', 'other'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Nutrient List */}
      <div className="space-y-4">
        {filteredNutrients.map(nutrient => {
          const percent = (nutrient.value / nutrient.dv) * 100;
          const isSodium = nutrient.name === 'Sodium';
          const isSugar = nutrient.name === 'Sugar';

          return (
            <div key={nutrient.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{nutrient.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/80">
                    {nutrient.value.toFixed(1)} {nutrient.unit}
                  </span>
                  <span className={`text-sm font-semibold min-w-[60px] text-right ${
                    getStatusColor(percent, isSodium, isSugar)
                  }`}>
                    {percent.toFixed(0)}% DV
                  </span>
                </div>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    getBarColor(percent, isSodium, isSugar)
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>

              {/* Warning for low/high intake */}
              {percent < 25 && !isSodium && !isSugar && (
                <p className="text-xs text-orange-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Low intake - consider adding {nutrient.name}-rich foods
                </p>
              )}

              {((isSodium && percent > 100) || (isSugar && percent > 100)) && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  High intake - try to reduce {nutrient.name.toLowerCase()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Overall Nutrient Status
        </h4>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-white/60 mb-1">Meeting Goals</p>
            <p className="text-2xl font-bold text-green-400">
              {nutrients.filter(n => (n.value / n.dv) * 100 >= 100).length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-white/60 mb-1">Needs Improvement</p>
            <p className="text-2xl font-bold text-yellow-400">
              {nutrients.filter(n => {
                const percent = (n.value / n.dv) * 100;
                return percent >= 25 && percent < 100;
              }).length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-white/60 mb-1">Low Intake</p>
            <p className="text-2xl font-bold text-red-400">
              {nutrients.filter(n => (n.value / n.dv) * 100 < 25).length}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
