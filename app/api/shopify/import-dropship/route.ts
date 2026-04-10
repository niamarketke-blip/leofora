import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken } from '../../../../lib/shopify';
import { dropshipCatalog } from '../../../../lib/dropship-catalog';

const DEFAULT_DELAY_MS = 2000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createShopifyProduct(shop: string, accessToken: string, product: typeof dropshipCatalog[0]) {
  const body = {
    product: {
      title: product.title,
      body_html: product.body_html,
      vendor: product.vendor,
      product_type: product.product_type,
      tags: product.tags.join(', '),
      status: 'active',
      variants: [
        {
          price: product.price,
          compare_at_price: product.compare_at_price,
          sku: product.sku,
          weight: product.weight,
          weight_unit: product.weight_unit,
          requires_shipping: product.requires_shipping,
          inventory_quantity: product.inventory_quantity,
          inventory_management: 'shopify',
        },
      ],
    },
  };

  const response = await fetch(`https://${shop}/admin/api/2026-04/products.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API error: ${error}`);
  }

  const data = await response.json();
  return data.product;
}

export async function GET() {
  return NextResponse.json({
    catalog: dropshipCatalog.map((p) => ({
      sku: p.sku,
      title: p.title,
      vendor: p.vendor,
      price: p.price,
      compare_at_price: p.compare_at_price,
      stock: p.inventory_quantity,
      type: p.product_type,
    })),
    total: dropshipCatalog.length,
  });
}

export async function POST(request: NextRequest) {
  const session = getShopifySession();
  const body = await request.json().catch(() => ({}));
  const requestShop = String(body?.shop || '').trim();
  const requestToken = String(body?.accessToken || '').trim();

  const shopDomain = session.shopDomain || requestShop;
  const accessToken = getShopifyAccessToken() || requestToken;

  if (!shopDomain) {
    return NextResponse.json(
      { error: 'Shopify store not connected. Connect first at /setup or provide shop in request body.' },
      { status: 400 }
    );
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing Shopify access token. Connect first or provide accessToken in request body.' }, { status: 400 });
  }

  const skus: string[] | undefined = body?.skus;
  const continueAfterFirst = body?.continueAfterFirst !== false;
  const stopOnFailure = body?.stopOnFailure !== false;
  const delayMs = typeof body?.delayMs === 'number' && body.delayMs >= 0
    ? Math.floor(body.delayMs)
    : DEFAULT_DELAY_MS;
  const catalog = skus
    ? dropshipCatalog.filter((p) => skus.includes(p.sku))
    : dropshipCatalog;

  const results: { sku: string; title: string; success: boolean; shopifyId?: number; error?: string }[] = [];

  let processed = 0;
  for (const product of catalog) {
    if (processed > 0 && !continueAfterFirst) {
      break;
    }

    if (processed > 0 && delayMs > 0) {
      await wait(delayMs);
    }

    try {
      const created = await createShopifyProduct(shopDomain, accessToken, product);
      results.push({ sku: product.sku, title: product.title, success: true, shopifyId: created.id });
    } catch (err) {
      results.push({
        sku: product.sku,
        title: product.title,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      if (stopOnFailure) {
        processed += 1;
        break;
      }
    }

    processed += 1;
  }

  const successCount = results.filter((r) => r.success).length;

  return NextResponse.json({
    success: true,
    message: `Imported ${successCount} of ${results.length} attempted dropship products into ${shopDomain}`,
    successCount,
    total: catalog.length,
    attempted: results.length,
    config: {
      continueAfterFirst,
      stopOnFailure,
      delayMs,
    },
    results,
  });
}
