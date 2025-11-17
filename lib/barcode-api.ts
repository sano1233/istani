/**
 * Open Food Facts API Integration
 * Free barcode database for food products worldwide
 * Documentation: https://world.openfoodfacts.org/data
 */

import axios from 'axios';
import type { FoodNutrition } from './usda-api';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';

export interface OpenFoodFactsProduct {
  code: string; // Barcode
  product_name: string;
  brands?: string;
  quantity?: string;
  serving_size?: string;
  image_url?: string;
  ingredients_text?: string;
  allergens?: string;
  nutriments: {
    [key: string]: number;
  };
  nutriscore_grade?: string;
  nova_group?: number;
}

export interface BarcodeSearchResult {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
}

/**
 * Search product by barcode using Open Food Facts
 */
export async function searchByBarcode(barcode: string): Promise<FoodNutrition | null> {
  try {
    const response = await axios.get<BarcodeSearchResult>(
      `${OPEN_FOOD_FACTS_API}/product/${barcode}.json`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Istani-Fitness-App/1.0 (contact@istani.org)',
        },
      }
    );

    if (response.data.status !== 1 || !response.data.product) {
      return null;
    }

    const product = response.data.product;
    const nutriments = product.nutriments;

    // Parse serving size
    let servingSize = 100; // Default to 100g
    let servingUnit = 'g';
    if (product.serving_size) {
      const match = product.serving_size.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/);
      if (match) {
        servingSize = parseFloat(match[1]);
        servingUnit = match[2];
      }
    }

    // Map Open Food Facts nutrients to our format
    const nutrition: FoodNutrition = {
      fdcId: parseInt(product.code), // Use barcode as pseudo FDC ID
      description: product.product_name || 'Unknown Product',
      brandName: product.brands,
      servingSize,
      servingUnit,
      barcode: product.code,
      ingredients: product.ingredients_text,

      // Macronutrients (per 100g in Open Food Facts)
      calories: nutriments['energy-kcal_100g'] || nutriments.energy_100g || undefined,
      protein: nutriments.proteins_100g,
      carbs: nutriments.carbohydrates_100g,
      fat: nutriments.fat_100g,
      saturatedFat: nutriments['saturated-fat_100g'],
      transFat: nutriments['trans-fat_100g'],
      polyunsaturatedFat: nutriments['polyunsaturated-fat_100g'],
      monounsaturatedFat: nutriments['monounsaturated-fat_100g'],
      cholesterol: nutriments.cholesterol_100g,
      fiber: nutriments.fiber_100g,
      sugar: nutriments.sugars_100g,

      // Vitamins (per 100g)
      vitaminA: nutriments['vitamin-a_100g'],
      vitaminC: nutriments['vitamin-c_100g'],
      vitaminD: nutriments['vitamin-d_100g'],
      vitaminE: nutriments['vitamin-e_100g'],
      vitaminK: nutriments['vitamin-k_100g'],
      vitaminB6: nutriments['vitamin-b6_100g'],
      vitaminB12: nutriments['vitamin-b12_100g'],
      folate: nutriments['folate_100g'] || nutriments['vitamin-b9_100g'],

      // Minerals (per 100g)
      calcium: nutriments.calcium_100g,
      iron: nutriments.iron_100g,
      magnesium: nutriments.magnesium_100g,
      phosphorus: nutriments.phosphorus_100g,
      potassium: nutriments.potassium_100g,
      sodium: nutriments.sodium_100g,
      zinc: nutriments.zinc_100g,
      selenium: nutriments.selenium_100g,

      // Other
      caffeine: nutriments.caffeine_100g,
      alcohol: nutriments.alcohol_100g,
    };

    // Scale to actual serving size (Open Food Facts gives per 100g)
    if (servingSize !== 100) {
      const multiplier = servingSize / 100;
      Object.keys(nutrition).forEach(key => {
        const value = nutrition[key as keyof FoodNutrition];
        if (typeof value === 'number') {
          (nutrition[key as keyof FoodNutrition] as any) = value * multiplier;
        }
      });
    }

    return nutrition;
  } catch (error) {
    console.error('Barcode search error:', error);
    return null;
  }
}

/**
 * Search products by text query using Open Food Facts
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 25
): Promise<{ products: FoodNutrition[]; count: number }> {
  try {
    const response = await axios.get(`${OPEN_FOOD_FACTS_API}/search`, {
      params: {
        search_terms: query,
        page,
        page_size: pageSize,
        fields: 'code,product_name,brands,serving_size,nutriments,image_url',
        json: 1,
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Istani-Fitness-App/1.0 (contact@istani.org)',
      },
    });

    const products: FoodNutrition[] = (response.data.products || []).map(
      (product: OpenFoodFactsProduct) => {
        const nutriments = product.nutriments;
        let servingSize = 100;
        let servingUnit = 'g';

        if (product.serving_size) {
          const match = product.serving_size.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/);
          if (match) {
            servingSize = parseFloat(match[1]);
            servingUnit = match[2];
          }
        }

        return {
          fdcId: parseInt(product.code),
          description: product.product_name || 'Unknown Product',
          brandName: product.brands,
          servingSize,
          servingUnit,
          barcode: product.code,

          calories: nutriments['energy-kcal_100g'] || nutriments.energy_100g || undefined,
          protein: nutriments.proteins_100g,
          carbs: nutriments.carbohydrates_100g,
          fat: nutriments.fat_100g,
          fiber: nutriments.fiber_100g,
          sugar: nutriments.sugars_100g,
          sodium: nutriments.sodium_100g,
        };
      }
    );

    return {
      products,
      count: response.data.count || 0,
    };
  } catch (error) {
    console.error('Product search error:', error);
    return { products: [], count: 0 };
  }
}

/**
 * Validate barcode format
 */
export function isValidBarcode(code: string): boolean {
  // UPC (12 digits), EAN-13 (13 digits), EAN-8 (8 digits)
  return /^(\d{8}|\d{12}|\d{13})$/.test(code);
}

/**
 * Format barcode for display
 */
export function formatBarcode(code: string): string {
  if (code.length === 13) {
    // EAN-13: XXX-XXXX-XXXX-X
    return `${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7, 12)}-${code.slice(12)}`;
  } else if (code.length === 12) {
    // UPC: XXX-XXX-XXX-XXX
    return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}-${code.slice(9)}`;
  } else if (code.length === 8) {
    // EAN-8: XXXX-XXXX
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}
