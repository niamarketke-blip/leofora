import { NextRequest, NextResponse } from 'next/server';
import { importEuProductsFromProvider } from '../../../../../lib/eu-import';
import { getShopifySession, getShopifyAccessToken } from '../../../../../lib/shopify';
import { adminProducts } from '../../../../../lib/admin-products-store';

async function createShopifyProduct(shop: string, accessToken: string, productData: any) {
  const response = await fetch(`https://${shop}/admin/api/2026-04/products.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product: {
        title: productData.title,
        handle: productData.handle,
        body_html: productData.bodyHtml,
        vendor: productData.vendor,
        product_type: productData.productType,
        variants: [
          {
            price: productData.price,
            sku: productData.sku,
            inventory_quantity: productData.quantity,
            track_inventory: true,
          },
        ],
      },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.product;
}

function authorizeCron(request: NextRequest) {
  const provided = request.headers.get('x-cron-key') || '';
  const expected = process.env.IMPORT_CRON_KEY || '';
  if (expected) return provided === expected;
  return provided === 'dev-local-manual-trigger';
}

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
  }

  try {
    const provider = process.env.DAILY_IMPORT_PROVIDER || 'bigbuy';
    const requiredCountries = (process.env.DAILY_IMPORT_COUNTRIES || 'IE,NL')
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const importResult = await importEuProductsFromProvider({
      provider,
      limit: Number(process.env.DAILY_IMPORT_LIMIT || 80),
      defaultMarkup: Number(process.env.DAILY_IMPORT_DEFAULT_MARKUP || 1.55),
      requiredCountries,
      marginRules: {
        plants: Number(process.env.MARGIN_RULE_PLANTS || 1.65),
        decor: Number(process.env.MARGIN_RULE_DECOR || 1.5),
        general: Number(process.env.MARGIN_RULE_GENERAL || 1.45),
      },
    });

    const session = getShopifySession();
    const accessToken = getShopifyAccessToken();
    if (!session.installed || !session.shopDomain || !accessToken) {
      return NextResponse.json({
        success: true,
        message: 'Import completed but Shopify sync skipped because store is not connected.',
        importResult,
      });
    }

    const sourceProducts = adminProducts.map((product) => ({
      title: product.name,
      handle: product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      bodyHtml: `${product.name} sourced for EU delivery (Ireland & Netherlands).`,
      vendor: product.supplierName || 'Leofora',
      productType: 'Fake Plants',
      price: product.price,
      sku: product.sku,
      quantity: product.stock,
    }));

    let synced = 0;
    for (const item of sourceProducts) {
      const created = await createShopifyProduct(session.shopDomain, accessToken, item);
      if (created) synced += 1;
    }

    return NextResponse.json({
      success: true,
      message: 'Daily import and Shopify sync completed.',
      provider,
      importedCount: importResult.importedCount,
      syncedCount: synced,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Daily import job failed.' }, { status: 500 });
  }
}
