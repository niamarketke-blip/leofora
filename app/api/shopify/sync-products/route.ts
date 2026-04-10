import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken } from '../../../../lib/shopify';
import { adminProducts } from '../../../../lib/admin-products-store';

async function createShopifyProduct(shop: string, accessToken: string, productData: any) {
  try {
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
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Shopify product creation error:', error);
      return null;
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Failed to create Shopify product:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = getShopifySession();
  
  if (!session.installed || !session.shopDomain) {
    return NextResponse.json(
      { error: 'Shopify store not connected. Please connect your store first.' },
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

    const results = [];
    
    for (const plant of sourceProducts) {
      console.log(`Creating product: ${plant.title}`);
      const product = await createShopifyProduct(session.shopDomain, accessToken, plant);
      results.push({
        sku: plant.sku,
        title: plant.title,
        success: product ? true : false,
        shopifyId: product?.id,
      });
    }

    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${successCount} of ${sourceProducts.length} products in Shopify store ${session.shopDomain}`,
      results,
    });
  } catch (error) {
    console.error('Sync products error:', error);
    return NextResponse.json(
      { error: 'Failed to sync products to Shopify.' },
      { status: 500 }
    );
  }
}
