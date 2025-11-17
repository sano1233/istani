import { NextRequest, NextResponse } from 'next/server';
import { searchByBarcode, isValidBarcode } from '@/lib/barcode-api';

/**
 * Lookup product by barcode
 * GET /api/nutrition/barcode?code=0123456789012
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Barcode code parameter is required' },
        { status: 400 }
      );
    }

    if (!isValidBarcode(code)) {
      return NextResponse.json(
        { error: 'Invalid barcode format. Must be 8, 12, or 13 digits' },
        { status: 400 }
      );
    }

    const product = await searchByBarcode(code);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Barcode lookup API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to lookup barcode' },
      { status: 500 }
    );
  }
}
