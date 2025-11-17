/**
 * USDA FoodData Central API Integration
 *
 * Free API Key: Get from https://fdc.nal.usda.gov/api-key-signup.html
 * Documentation: https://fdc.nal.usda.gov/api-guide.html
 */

import axios from 'axios';

// USDA API Configuration
const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string; // 'Foundation', 'SR Legacy', 'Branded', etc.
  brandName?: string;
  brandOwner?: string;
  gtinUpc?: string; // Barcode
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  ingredients?: string;
  foodNutrients: USDANutrient[];
}

export interface USDASearchResult {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

export interface FoodNutrition {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  servingSize?: number;
  servingUnit?: string;
  householdServing?: string;
  barcode?: string;
  ingredients?: string;

  // Macronutrients
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  saturatedFat?: number;
  transFat?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  cholesterol?: number;
  fiber?: number;
  sugar?: number;
  addedSugar?: number;

  // Vitamins
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  pantothenicAcid?: number;
  biotin?: number;
  choline?: number;

  // Minerals
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  copper?: number;
  selenium?: number;
  manganese?: number;
  chromium?: number;
  iodine?: number;

  // Other
  omega3?: number;
  omega6?: number;
  caffeine?: number;
  alcohol?: number;
  water?: number;
}

/**
 * Nutrient ID mapping for USDA FoodData Central
 * Reference: https://fdc.nal.usda.gov/data-documentation.html
 */
const NUTRIENT_MAP: { [key: number]: keyof FoodNutrition } = {
  1008: 'calories',       // Energy (kcal)
  1003: 'protein',        // Protein (g)
  1005: 'carbs',          // Carbohydrate (g)
  1004: 'fat',            // Total lipid (fat) (g)
  1258: 'saturatedFat',   // Fatty acids, total saturated (g)
  1257: 'transFat',       // Fatty acids, total trans (g)
  1293: 'polyunsaturatedFat', // Fatty acids, total polyunsaturated (g)
  1292: 'monounsaturatedFat', // Fatty acids, total monounsaturated (g)
  1253: 'cholesterol',    // Cholesterol (mg)
  1079: 'fiber',          // Fiber, total dietary (g)
  2000: 'sugar',          // Sugars, total (g)
  1235: 'addedSugar',     // Sugars, added (g)

  // Vitamins
  1106: 'vitaminA',       // Vitamin A, RAE (mcg)
  1162: 'vitaminC',       // Vitamin C (mg)
  1114: 'vitaminD',       // Vitamin D (mcg)
  1109: 'vitaminE',       // Vitamin E (mg)
  1185: 'vitaminK',       // Vitamin K (mcg)
  1165: 'thiamin',        // Thiamin (B1) (mg)
  1166: 'riboflavin',     // Riboflavin (B2) (mg)
  1167: 'niacin',         // Niacin (B3) (mg)
  1175: 'vitaminB6',      // Vitamin B-6 (mg)
  1177: 'folate',         // Folate, total (mcg)
  1178: 'vitaminB12',     // Vitamin B-12 (mcg)
  1170: 'pantothenicAcid', // Pantothenic acid (B5) (mg)
  1176: 'biotin',         // Biotin (mcg)
  1180: 'choline',        // Choline, total (mg)

  // Minerals
  1087: 'calcium',        // Calcium (mg)
  1089: 'iron',           // Iron (mg)
  1090: 'magnesium',      // Magnesium (mg)
  1091: 'phosphorus',     // Phosphorus (mg)
  1092: 'potassium',      // Potassium (mg)
  1093: 'sodium',         // Sodium (mg)
  1095: 'zinc',           // Zinc (mg)
  1098: 'copper',         // Copper (mg)
  1103: 'selenium',       // Selenium (mcg)
  1101: 'manganese',      // Manganese (mg)
  1096: 'chromium',       // Chromium (mcg)
  1100: 'iodine',         // Iodine (mcg)

  // Other
  1404: 'omega3',         // Fatty acids, total omega-3 (g)
  1405: 'omega6',         // Fatty acids, total omega-6 (g)
  1057: 'caffeine',       // Caffeine (mg)
  1018: 'alcohol',        // Alcohol, ethyl (g)
  1051: 'water',          // Water (g)
};

/**
 * Parse USDA nutrients into simplified nutrition object
 */
function parseNutrients(nutrients: USDANutrient[]): Partial<FoodNutrition> {
  const nutrition: Partial<FoodNutrition> = {};

  nutrients.forEach(nutrient => {
    const key = NUTRIENT_MAP[nutrient.nutrientId];
    if (key) {
      nutrition[key] = nutrient.value;
    }
  });

  return nutrition;
}

/**
 * Search USDA food database
 */
export async function searchFoods(
  query: string,
  options?: {
    pageSize?: number;
    pageNumber?: number;
    dataType?: string[]; // e.g., ['Foundation', 'SR Legacy', 'Branded']
    brandOwner?: string;
  }
): Promise<USDASearchResult> {
  try {
    const params = {
      api_key: USDA_API_KEY,
      query,
      pageSize: options?.pageSize || 25,
      pageNumber: options?.pageNumber || 1,
      dataType: options?.dataType?.join(','),
      brandOwner: options?.brandOwner,
    };

    const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
      params,
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error('USDA API search error:', error);
    throw new Error('Failed to search foods');
  }
}

/**
 * Get detailed food information by FDC ID
 */
export async function getFoodDetails(fdcId: number): Promise<FoodNutrition> {
  try {
    const response = await axios.get(`${USDA_BASE_URL}/food/${fdcId}`, {
      params: {
        api_key: USDA_API_KEY,
        format: 'full',
      },
      timeout: 10000,
    });

    const food: USDAFood = response.data;
    const nutrients = parseNutrients(food.foodNutrients);

    return {
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName,
      brandOwner: food.brandOwner,
      servingSize: food.servingSize,
      servingUnit: food.servingSizeUnit,
      householdServing: food.householdServingFullText,
      barcode: food.gtinUpc,
      ingredients: food.ingredients,
      ...nutrients,
    };
  } catch (error) {
    console.error('USDA API food details error:', error);
    throw new Error('Failed to fetch food details');
  }
}

/**
 * Get multiple foods by FDC IDs (batch request)
 */
export async function getFoodsBatch(fdcIds: number[]): Promise<FoodNutrition[]> {
  try {
    const response = await axios.post(
      `${USDA_BASE_URL}/foods`,
      {
        fdcIds,
        format: 'full',
      },
      {
        params: {
          api_key: USDA_API_KEY,
        },
        timeout: 15000,
      }
    );

    return response.data.map((food: USDAFood) => {
      const nutrients = parseNutrients(food.foodNutrients);
      return {
        fdcId: food.fdcId,
        description: food.description,
        brandName: food.brandName,
        brandOwner: food.brandOwner,
        servingSize: food.servingSize,
        servingUnit: food.servingSizeUnit,
        householdServing: food.householdServingFullText,
        barcode: food.gtinUpc,
        ingredients: food.ingredients,
        ...nutrients,
      };
    });
  } catch (error) {
    console.error('USDA API batch error:', error);
    throw new Error('Failed to fetch foods batch');
  }
}

/**
 * Calculate nutrition for a specific serving size
 */
export function calculateServingNutrition(
  food: FoodNutrition,
  servingAmount: number,
  servingUnit?: string
): Partial<FoodNutrition> {
  if (!food.servingSize) {
    return food;
  }

  const multiplier = servingAmount / food.servingSize;
  const scaledNutrition: Partial<FoodNutrition> = {
    fdcId: food.fdcId,
    description: food.description,
    brandName: food.brandName,
    servingSize: servingAmount,
    servingUnit: servingUnit || food.servingUnit,
  };

  // Scale all numeric nutrients
  Object.entries(food).forEach(([key, value]) => {
    if (typeof value === 'number' && key !== 'fdcId' && key !== 'servingSize') {
      scaledNutrition[key as keyof FoodNutrition] = value * multiplier;
    }
  });

  return scaledNutrition;
}

/**
 * Format nutrition value with appropriate precision
 */
export function formatNutrientValue(value: number | undefined, decimals: number = 1): string {
  if (value === undefined || value === null) return '0';
  return value.toFixed(decimals);
}

/**
 * Get daily recommended intake (DRI) for nutrients
 * Based on average adult (2000 calorie diet)
 * Source: FDA Daily Values
 */
export const DAILY_VALUES: { [key in keyof FoodNutrition]?: number } = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  saturatedFat: 20,
  transFat: 0,
  cholesterol: 300,
  fiber: 28,
  sugar: 50,
  addedSugar: 50,

  // Vitamins
  vitaminA: 900,      // mcg
  vitaminC: 90,       // mg
  vitaminD: 20,       // mcg
  vitaminE: 15,       // mg
  vitaminK: 120,      // mcg
  thiamin: 1.2,       // mg
  riboflavin: 1.3,    // mg
  niacin: 16,         // mg
  vitaminB6: 1.7,     // mg
  folate: 400,        // mcg
  vitaminB12: 2.4,    // mcg
  pantothenicAcid: 5, // mg
  biotin: 30,         // mcg
  choline: 550,       // mg

  // Minerals
  calcium: 1300,      // mg
  iron: 18,           // mg
  magnesium: 420,     // mg
  phosphorus: 1250,   // mg
  potassium: 4700,    // mg
  sodium: 2300,       // mg
  zinc: 11,           // mg
  copper: 0.9,        // mg
  selenium: 55,       // mcg
  manganese: 2.3,     // mg
  chromium: 35,       // mcg
  iodine: 150,        // mcg

  // Other
  omega3: 1.6,        // g
  omega6: 17,         // g
  caffeine: 400,      // mg
  water: 3700,        // g (men), 2700 g (women)
};

/**
 * Calculate % Daily Value for a nutrient
 */
export function calculateDailyValuePercent(
  nutrient: keyof FoodNutrition,
  amount: number
): number {
  const dv = DAILY_VALUES[nutrient];
  if (!dv) return 0;
  return (amount / dv) * 100;
}
