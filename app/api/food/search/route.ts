import { NextRequest, NextResponse } from 'next/server';
import { USDAAPI, OpenFoodFactsAPI } from '@/lib/api-integrations';

/**
 * Search food items from USDA and OpenFoodFacts
 * GET /api/food/search?query=chicken&source=usda|openfoodfacts|both
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const source = searchParams.get('source') || 'both';
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const usda = new USDAAPI();
    const openFoodFacts = new OpenFoodFactsAPI();

    interface SearchResults {
      usda?: {
        foods?: unknown[];
        totalHits?: number;
        error?: string;
      };
      openFoodFacts?: {
        products?: unknown[];
        count?: number;
        error?: string;
      };
      error?: string;
    }

    const results: SearchResults = {};

    if (source === 'usda' || source === 'both') {
      try {
        if (process.env.USDA_API_KEY) {
          const usdaData = await usda.searchFoods(query, pageSize);
          results.usda = {
            foods: usdaData.foods || [],
            totalHits: usdaData.totalHits || 0,
          };
        } else {
          results.usda = { error: 'USDA API key not configured' };
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.usda = { error: errorMessage };
      }
    }

    if (source === 'openfoodfacts' || source === 'both') {
      try {
        const offData = await openFoodFacts.searchProducts(query, pageSize);
        results.openFoodFacts = {
          products: offData.products || [],
          count: offData.count || 0,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.openFoodFacts = { error: errorMessage };
      }
    }

    return NextResponse.json({
      query,
      source,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
