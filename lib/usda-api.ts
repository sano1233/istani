/**
 * USDA FoodData Central API Integration
 * Provides access to comprehensive nutrition database with 30+ micronutrients
 * API Documentation: https://fdc.nal.usda.gov/api-guide.html
 */

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
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
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDANutrient[];
  foodCategory?: string;
  gtinUpc?: string;
}

export interface USDASearchResult {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

export interface NutrientProfile {
  // Macronutrients
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;

  // Vitamins
  vitaminA?: number; // mcg RAE
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  vitaminE?: number; // mg
  vitaminK?: number; // mcg
  vitaminB1?: number; // Thiamin, mg
  vitaminB2?: number; // Riboflavin, mg
  vitaminB3?: number; // Niacin, mg
  vitaminB5?: number; // Pantothenic acid, mg
  vitaminB6?: number; // mg
  vitaminB7?: number; // Biotin, mcg
  vitaminB9?: number; // Folate, mcg DFE
  vitaminB12?: number; // mcg

  // Minerals
  calcium?: number; // mg
  iron?: number; // mg
  magnesium?: number; // mg
  phosphorus?: number; // mg
  potassium?: number; // mg
  sodium?: number; // mg
  zinc?: number; // mg
  copper?: number; // mg
  manganese?: number; // mg
  selenium?: number; // mcg
  chromium?: number; // mcg
  molybdenum?: number; // mcg
  iodine?: number; // mcg

  // Fatty Acids
  saturatedFat?: number; // g
  monounsaturatedFat?: number; // g
  polyunsaturatedFat?: number; // g
  transFat?: number; // g
  omega3?: number; // g
  omega6?: number; // g

  // Amino Acids (essential)
  histidine?: number; // g
  isoleucine?: number; // g
  leucine?: number; // g
  lysine?: number; // g
  methionine?: number; // g
  phenylalanine?: number; // g
  threonine?: number; // g
  tryptophan?: number; // g
  valine?: number; // g

  // Other
  cholesterol?: number; // mg
  caffeine?: number; // mg
  alcohol?: number; // g
  water?: number; // g
}

/**
 * Nutrient ID mapping from USDA FoodData Central
 * Source: https://fdc.nal.usda.gov/portal-data/external/dataDictionary
 */
const NUTRIENT_MAP: Record<string, keyof NutrientProfile> = {
  // Macronutrients
  '1008': 'calories', // Energy (kcal)
  '1003': 'protein', // Protein
  '1005': 'carbs', // Carbohydrate
  '1004': 'fat', // Total lipid (fat)
  '1079': 'fiber', // Fiber, total dietary
  '2000': 'sugar', // Sugars, total

  // Vitamins
  '1106': 'vitaminA', // Vitamin A, RAE
  '1162': 'vitaminC', // Vitamin C
  '1114': 'vitaminD', // Vitamin D (D2 + D3)
  '1109': 'vitaminE', // Vitamin E
  '1185': 'vitaminK', // Vitamin K
  '1165': 'vitaminB1', // Thiamin
  '1166': 'vitaminB2', // Riboflavin
  '1167': 'vitaminB3', // Niacin
  '1170': 'vitaminB5', // Pantothenic acid
  '1175': 'vitaminB6', // Vitamin B6
  '1176': 'vitaminB7', // Biotin
  '1177': 'vitaminB9', // Folate, DFE
  '1178': 'vitaminB12', // Vitamin B12

  // Minerals
  '1087': 'calcium', // Calcium
  '1089': 'iron', // Iron
  '1090': 'magnesium', // Magnesium
  '1091': 'phosphorus', // Phosphorus
  '1092': 'potassium', // Potassium
  '1093': 'sodium', // Sodium
  '1095': 'zinc', // Zinc
  '1098': 'copper', // Copper
  '1101': 'manganese', // Manganese
  '1103': 'selenium', // Selenium
  '1096': 'chromium', // Chromium
  '1102': 'molybdenum', // Molybdenum
  '1100': 'iodine', // Iodine

  // Fatty Acids
  '1258': 'saturatedFat', // Fatty acids, total saturated
  '1292': 'monounsaturatedFat', // Fatty acids, total monounsaturated
  '1293': 'polyunsaturatedFat', // Fatty acids, total polyunsaturated
  '1257': 'transFat', // Fatty acids, total trans
  '1404': 'omega3', // Fatty acids, total omega-3
  '1405': 'omega6', // Fatty acids, total omega-6

  // Amino Acids
  '1221': 'histidine', // Histidine
  '1212': 'isoleucine', // Isoleucine
  '1213': 'leucine', // Leucine
  '1214': 'lysine', // Lysine
  '1215': 'methionine', // Methionine
  '1217': 'phenylalanine', // Phenylalanine
  '1211': 'threonine', // Threonine
  '1210': 'tryptophan', // Tryptophan
  '1219': 'valine', // Valine

  // Other
  '1253': 'cholesterol', // Cholesterol
  '1057': 'caffeine', // Caffeine
  '1018': 'alcohol', // Alcohol, ethyl
  '1051': 'water', // Water
};

/**
 * Search for foods in USDA FoodData Central
 */
export async function searchUSDAFoods(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    dataType?: 'Branded' | 'SR Legacy' | 'Survey (FNDDS)' | 'Foundation';
    sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<USDASearchResult> {
  const {
    page = 1,
    pageSize = 25,
    dataType,
    sortBy = 'dataType.keyword',
    sortOrder = 'asc',
  } = options;

  const params = new URLSearchParams({
    api_key: USDA_API_KEY,
    query,
    pageSize: pageSize.toString(),
    pageNumber: page.toString(),
    sortBy,
    sortOrder,
  });

  if (dataType) {
    params.append('dataType', dataType);
  }

  const response = await fetch(`${USDA_BASE_URL}/foods/search?${params}`);

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get detailed food information by FDC ID
 */
export async function getUSDAFood(fdcId: number): Promise<USDAFood> {
  const params = new URLSearchParams({
    api_key: USDA_API_KEY,
    format: 'full',
  });

  const response = await fetch(`${USDA_BASE_URL}/food/${fdcId}?${params}`);

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search for food by barcode (UPC/GTIN)
 */
export async function searchUSDAByBarcode(barcode: string): Promise<USDAFood | null> {
  const result = await searchUSDAFoods(barcode, {
    dataType: 'Branded',
    pageSize: 10,
  });

  // Find exact match by UPC
  const match = result.foods.find(food => food.gtinUpc === barcode);

  if (!match) return null;

  // Get full details
  return getUSDAFood(match.fdcId);
}

/**
 * Convert USDA food nutrients to structured nutrient profile
 */
export function parseNutrientProfile(food: USDAFood): NutrientProfile {
  const profile: NutrientProfile = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  for (const nutrient of food.foodNutrients) {
    const nutrientKey = NUTRIENT_MAP[nutrient.nutrientId.toString()];
    if (nutrientKey) {
      profile[nutrientKey] = nutrient.value;
    }
  }

  return profile;
}

/**
 * Get multiple foods by FDC IDs (batch request)
 */
export async function getUSDAFoodsBatch(fdcIds: number[]): Promise<USDAFood[]> {
  const params = new URLSearchParams({
    api_key: USDA_API_KEY,
    format: 'full',
  });

  const response = await fetch(`${USDA_BASE_URL}/foods?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fdcIds }),
  });

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get autocomplete suggestions for food search
 */
export async function getUSDAAutocomplete(query: string, limit: number = 10): Promise<string[]> {
  if (query.length < 2) return [];

  const result = await searchUSDAFoods(query, {
    pageSize: limit,
    sortBy: 'lowercaseDescription.keyword',
  });

  return result.foods.map(food => food.description);
}

/**
 * Calculate nutrient totals for a meal with multiple foods
 */
export function calculateMealNutrients(
  foods: Array<{ profile: NutrientProfile; servings: number }>
): NutrientProfile {
  const total: NutrientProfile = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  for (const { profile, servings } of foods) {
    for (const key in profile) {
      const nutrientKey = key as keyof NutrientProfile;
      const value = profile[nutrientKey];
      if (value !== undefined) {
        total[nutrientKey] = (total[nutrientKey] || 0) + value * servings;
      }
    }
  }

  return total;
}

/**
 * Check if food meets specific dietary requirements
 */
export function checkDietaryCompliance(
  profile: NutrientProfile,
  requirements: {
    maxSugar?: number;
    maxSodium?: number;
    maxCholesterol?: number;
    maxSaturatedFat?: number;
    minProtein?: number;
    minFiber?: number;
  }
): { compliant: boolean; violations: string[] } {
  const violations: string[] = [];

  if (requirements.maxSugar && profile.sugar && profile.sugar > requirements.maxSugar) {
    violations.push(`Sugar: ${profile.sugar}g exceeds limit of ${requirements.maxSugar}g`);
  }

  if (requirements.maxSodium && profile.sodium && profile.sodium > requirements.maxSodium) {
    violations.push(`Sodium: ${profile.sodium}mg exceeds limit of ${requirements.maxSodium}mg`);
  }

  if (requirements.maxCholesterol && profile.cholesterol && profile.cholesterol > requirements.maxCholesterol) {
    violations.push(`Cholesterol: ${profile.cholesterol}mg exceeds limit of ${requirements.maxCholesterol}mg`);
  }

  if (requirements.maxSaturatedFat && profile.saturatedFat && profile.saturatedFat > requirements.maxSaturatedFat) {
    violations.push(`Saturated Fat: ${profile.saturatedFat}g exceeds limit of ${requirements.maxSaturatedFat}g`);
  }

  if (requirements.minProtein && profile.protein < requirements.minProtein) {
    violations.push(`Protein: ${profile.protein}g below minimum of ${requirements.minProtein}g`);
  }

  if (requirements.minFiber && profile.fiber < requirements.minFiber) {
    violations.push(`Fiber: ${profile.fiber}g below minimum of ${requirements.minFiber}g`);
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}
