import { NextRequest, NextResponse } from 'next/server';
import { searchUSDAFoods, parseNutrientProfile, getUSDAAutocomplete } from '@/lib/usda-api';
import { OpenFoodFactsAPI } from '@/lib/api-integrations';

/**
 * Enhanced food search with USDA FoodData Central and OpenFoodFacts
 * GET /api/food/search?query=chicken&source=usda|openfoodfacts|both&autocomplete=true
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const source = searchParams.get('source') || 'both';
    const pageSize = parseInt(searchParams.get('page_size') || '25');
    const page = parseInt(searchParams.get('page') || '1');
    const autocomplete = searchParams.get('autocomplete') === 'true';
    const dataType = searchParams.get('data_type') as 'Branded' | 'SR Legacy' | 'Survey (FNDDS)' | 'Foundation' | undefined;

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Handle autocomplete requests
    if (autocomplete) {
      const suggestions = await getUSDAAutocomplete(query, 10);
      return NextResponse.json({
        query,
        suggestions,
        timestamp: new Date().toISOString(),
      });
    }

    const results: {
      usda?: {
        foods: any[];
        totalHits: number;
        currentPage: number;
        totalPages: number;
      };
      openFoodFacts?: {
        products: any[];
        count: number;
      };
      error?: string;
    } = {};

    // Search USDA FoodData Central
    if (source === 'usda' || source === 'both') {
      try {
        if (process.env.USDA_API_KEY || process.env.USDA_API_KEY === 'DEMO_KEY') {
          const usdaData = await searchUSDAFoods(query, {
            page,
            pageSize,
            dataType,
            sortBy: 'dataType.keyword',
            sortOrder: 'asc',
          });

          // Parse nutrient profiles for each food
          const foodsWithNutrients = usdaData.foods.map(food => ({
            ...food,
            nutrientProfile: parseNutrientProfile(food),
          }));

          results.usda = {
            foods: foodsWithNutrients,
            totalHits: usdaData.totalHits,
            currentPage: usdaData.currentPage,
            totalPages: usdaData.totalPages,
          };
        } else {
          results.usda = {
            foods: [],
            totalHits: 0,
            currentPage: 1,
            totalPages: 0,
          };
        }
      } catch (error: any) {
        console.error('USDA API error:', error);
        results.usda = {
          foods: [],
          totalHits: 0,
          currentPage: 1,
          totalPages: 0,
        };
      }
    }

    // Search OpenFoodFacts
    if (source === 'openfoodfacts' || source === 'both') {
      try {
        const openFoodFacts = new OpenFoodFactsAPI();
        const offData = await openFoodFacts.searchProducts(query, pageSize);
        results.openFoodFacts = {
          products: offData.products || [],
          count: offData.count || 0,
        };
      } catch (error: any) {
        console.error('OpenFoodFacts API error:', error);
        results.openFoodFacts = {
          products: [],
          count: 0,
        };
      }
    }

    return NextResponse.json({
      query,
      source,
      dataType,
      page,
      pageSize,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Food search error:', error);
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
