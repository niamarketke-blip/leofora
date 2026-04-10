import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken } from '../../../../lib/shopify';

export async function GET(request: NextRequest) {
  const session = getShopifySession();

  if (!session.installed || !session.shopDomain) {
    return NextResponse.json(
      { error: 'Shopify store not connected.' },
      { status: 400 }
    );
  }

  const accessToken = getShopifyAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing Shopify access token.' },
      { status: 400 }
    );
  }

  try {
    // Fetch shop info
    const shopResponse = await fetch(
      `https://${session.shopDomain}/admin/api/2026-04/shop.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!shopResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch shop details.' },
        { status: 500 }
      );
    }

    const shopData = await shopResponse.json();
    const shop = shopData.shop;

    // Fetch payment settings
    const paymentSettingsResponse = await fetch(
      `https://${session.shopDomain}/admin/api/2026-04/payments_settings.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    let paymentSettings = null;
    if (paymentSettingsResponse.ok) {
      const psData = await paymentSettingsResponse.json();
      paymentSettings = psData.payments_settings;
    }

    return NextResponse.json({
      success: true,
      store: {
        id: shop.id,
        name: shop.name,
        domain: shop.domain,
        myshopifyDomain: shop.myshopify_domain,
        email: shop.email,
        currency: shop.currency,
        timezone: shop.timezone,
        country: shop.country_code,
        address: shop.address1,
        city: shop.city,
      },
      paymentSettings,
    });
  } catch (error) {
    console.error('Store details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store details.' },
      { status: 500 }
    );
  }
}
