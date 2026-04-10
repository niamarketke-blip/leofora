import { NextRequest, NextResponse } from 'next/server';
import { saveShopifySession } from '../../../../lib/shopify';

function normalizeShopDomain(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleaned) return '';
  if (cleaned.includes('.myshopify.com')) return cleaned;
  if (!cleaned.includes('.')) return `${cleaned}.myshopify.com`;
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shop = normalizeShopDomain(String(body?.shop || ''));
    const accessToken = String(body?.accessToken || '').trim();

    if (!shop || !accessToken) {
      return NextResponse.json({ error: 'shop and accessToken are required.' }, { status: 400 });
    }

    saveShopifySession(shop, accessToken);

    return NextResponse.json({
      success: true,
      installed: true,
      shop,
      message: 'Shopify connected successfully with access token.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to connect Shopify store.' }, { status: 500 });
  }
}
