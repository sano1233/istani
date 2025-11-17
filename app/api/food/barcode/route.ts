import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsAPI } from '@/lib/api-integrations';

/**
 * Get food product by barcode
 * GET /api/food/barcode?code=1234567890
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Barcode code parameter is required' }, { status: 400 });
    }

    const openFoodFacts = new OpenFoodFactsAPI();
    const product = await openFoodFacts.getProductByBarcode(code);

    if (product.status === 0) {
      return NextResponse.json({ error: 'Product not found', code }, { status: 404 });
    }

    // Format the product data for our app
    const formattedProduct = {
      name: product.product?.product_name || product.product?.product_name_en || 'Unknown',
      brand: product.product?.brands || '',
      barcode: code,
      nutrition: {
        calories: product.product?.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.product?.nutriments?.proteins_100g || 0,
        carbs: product.product?.nutriments?.carbohydrates_100g || 0,
        fats: product.product?.nutriments?.fat_100g || 0,
        fiber: product.product?.nutriments?.fiber_100g || 0,
        sugar: product.product?.nutriments?.sugars_100g || 0,
        sodium: product.product?.nutriments?.sodium_100g || 0,
      },
      image: product.product?.image_url || product.product?.image_front_url || null,
      ingredients: product.product?.ingredients_text || '',
      servingSize: product.product?.serving_size || '100g',
      raw: product.product, // Include raw data for advanced use
    };

    return NextResponse.json({
      success: true,
      product: formattedProduct,
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
