import { NextRequest, NextResponse } from 'next/server';
import { searchUSDAByBarcode, parseNutrientProfile } from '@/lib/usda-api';
import { OpenFoodFactsAPI } from '@/lib/api-integrations';

/**
 * Enhanced barcode food lookup with USDA and OpenFoodFacts
 * GET /api/food/barcode?code=012345678901&source=usda|openfoodfacts|both
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code') || searchParams.get('barcode') || '';
    const source = searchParams.get('source') || 'both';

    if (!code) {
      return NextResponse.json(
        { error: 'Barcode parameter is required' },
        { status: 400 }
      );
    }

    // Validate barcode format (UPC-A: 12 digits, EAN-13: 13 digits, EAN-8: 8 digits)
    if (!/^\d{8,14}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid barcode format. Must be 8-14 digits.' },
        { status: 400 }
      );
    }

    const results: {
      usda?: any;
      openFoodFacts?: any;
      matched: boolean;
      primarySource?: 'usda' | 'openfoodfacts';
    } = {
      matched: false,
    };

    let formattedProduct: any = null;

    // Try USDA first (branded foods with comprehensive nutrients)
    if (source === 'usda' || source === 'both') {
      try {
        const usdaFood = await searchUSDAByBarcode(code);
        if (usdaFood) {
          const nutrientProfile = parseNutrientProfile(usdaFood);
          results.usda = {
            ...usdaFood,
            nutrientProfile,
          };
          results.matched = true;
          results.primarySource = 'usda';

          // Format USDA data for UI
          formattedProduct = {
            name: usdaFood.description,
            brand: usdaFood.brandOwner || usdaFood.brandName || '',
            barcode: code,
            nutrition: {
              calories: nutrientProfile.calories || 0,
              protein: nutrientProfile.protein || 0,
              carbs: nutrientProfile.carbs || 0,
              fats: nutrientProfile.fat || 0,
              fiber: nutrientProfile.fiber || 0,
              sugar: nutrientProfile.sugar || 0,
              sodium: nutrientProfile.sodium || 0,
              // Micronutrients
              vitaminA: nutrientProfile.vitaminA,
              vitaminC: nutrientProfile.vitaminC,
              vitaminD: nutrientProfile.vitaminD,
              calcium: nutrientProfile.calcium,
              iron: nutrientProfile.iron,
              potassium: nutrientProfile.potassium,
            },
            fullNutrientProfile: nutrientProfile,
            image: null,
            ingredients: usdaFood.ingredients || '',
            servingSize: usdaFood.householdServingFullText ||
                        (usdaFood.servingSize ? `${usdaFood.servingSize}${usdaFood.servingSizeUnit || 'g'}` : '100g'),
            source: 'USDA FoodData Central',
            fdcId: usdaFood.fdcId,
          };
        }
      } catch (error: any) {
        console.error('USDA barcode lookup error:', error);
        results.usda = { error: error.message };
      }
    }

    // Try OpenFoodFacts (fallback or additional data like images)
    if (source === 'openfoodfacts' || source === 'both') {
      try {
        const openFoodFacts = new OpenFoodFactsAPI();
        const product = await openFoodFacts.getProductByBarcode(code);

        if (product.status === 1 && product.product) {
          results.openFoodFacts = product.product;

          // If USDA didn't find it, use OpenFoodFacts data
          if (!results.matched) {
            results.matched = true;
            results.primarySource = 'openfoodfacts';

            formattedProduct = {
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
              source: 'OpenFoodFacts',
            };
          } else if (formattedProduct && !formattedProduct.image && product.product?.image_url) {
            // Add image from OpenFoodFacts to USDA data
            formattedProduct.image = product.product.image_url || product.product.image_front_url;
          }
        } else {
          results.openFoodFacts = { error: 'Product not found' };
        }
      } catch (error: any) {
        console.error('OpenFoodFacts barcode lookup error:', error);
        results.openFoodFacts = { error: error.message };
      }
    }

    if (!results.matched) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found in any database',
          barcode: code,
          results,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: formattedProduct,
      barcode: code,
      source: results.primarySource,
      rawData: {
        usda: results.usda,
        openFoodFacts: results.openFoodFacts,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
