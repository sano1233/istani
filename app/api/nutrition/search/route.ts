import { NextRequest, NextResponse } from 'next/server';
import { searchFoods } from '@/lib/usda-api';
import { searchProducts } from '@/lib/barcode-api';

/**
 * Search foods from USDA and Open Food Facts databases
 * GET /api/nutrition/search?q=chicken&source=usda
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const source = searchParams.get('source') || 'usda'; // 'usda' or 'off'
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (source === 'usda') {
      const results = await searchFoods(query, {
        pageSize,
        pageNumber: page,
      });

      return NextResponse.json({
        source: 'usda',
        totalHits: results.totalHits,
        currentPage: results.currentPage,
        totalPages: results.totalPages,
        foods: results.foods,
      });
    } else if (source === 'off') {
      const results = await searchProducts(query, page, pageSize);

      return NextResponse.json({
        source: 'openfoodfacts',
        count: results.count,
        foods: results.products,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid source. Use "usda" or "off"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Food search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search foods' },
      { status: 500 }
    );
  }
}
