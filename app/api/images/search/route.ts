import { NextRequest, NextResponse } from 'next/server';
import { PexelsAPI, UnsplashAPI } from '@/lib/api-integrations';

/**
 * Search images from Pexels and Unsplash
 * GET /api/images/search?query=fitness&source=pexels|unsplash|both
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'fitness';
    const source = searchParams.get('source') || 'both';
    const perPage = parseInt(searchParams.get('per_page') || '15');

    const pexels = new PexelsAPI();
    const unsplash = new UnsplashAPI();

    interface ImageSearchResults {
      pexels?: {
        photos?: unknown[];
        total?: number;
        error?: string;
      };
      unsplash?: {
        photos?: unknown[];
        total?: number;
        error?: string;
      };
      error?: string;
    }

    const results: ImageSearchResults = {};

    if (source === 'pexels' || source === 'both') {
      try {
        const pexelsData = await pexels.searchPhotos(query, perPage);
        results.pexels = {
          photos: pexelsData.photos || [],
          total: pexelsData.total_results || 0,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.pexels = { error: errorMessage };
      }
    }

    if (source === 'unsplash' || source === 'both') {
      try {
        const unsplashData = await unsplash.searchPhotos(query, perPage);
        results.unsplash = {
          photos: unsplashData.results || [],
          total: unsplashData.total || 0,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.unsplash = { error: errorMessage };
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
