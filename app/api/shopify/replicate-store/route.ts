import { NextRequest, NextResponse } from 'next/server';
import { fetchShopifyProducts, getShopifyAccessToken, getShopifySession } from '../../../../lib/shopify';
import { AdminProduct, replaceAdminProducts } from '../../../../lib/admin-products-store';

function mapShopifyToAdminProducts(edges: any[]): AdminProduct[] {
  let id = 1;

  return edges.map((edge: any) => {
    const product = edge?.node || {};
    const variant = product?.variants?.edges?.[0]?.node || {};
    const sku = String(variant?.sku || `SHOP-${id}`).trim();
    const stock = Number(variant?.inventoryQuantity || 0);
    const price = Number.parseFloat(String(variant?.price || product?.priceRange?.minVariantPrice?.amount || 0)) || 0;
    const vendor = String(product?.vendor || 'Shopify Supplier').trim();

    const mapped: AdminProduct = {
      id: id++,
      name: String(product?.title || 'Untitled product'),
      price,
      sku,
      shopifyId: String(product?.id || ''),
      inStock: stock > 0,
      stock,
      supplierId: `shopify-${vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'supplier'}`,
      supplierName: vendor,
    };

    return mapped;
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = getShopifySession();
    if (!session.installed || !session.shopDomain) {
      return NextResponse.json({ error: 'Shopify store is not connected.' }, { status: 400 });
    }

    const accessToken = getShopifyAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing Shopify access token.' }, { status: 400 });
    }

    const shopProducts = await fetchShopifyProducts(session.shopDomain, accessToken);
    if (!shopProducts || shopProducts.length === 0) {
      return NextResponse.json({ error: 'No products found in Shopify store.' }, { status: 404 });
    }

    const adminCatalog = mapShopifyToAdminProducts(shopProducts);
    replaceAdminProducts(adminCatalog);

    return NextResponse.json({
      success: true,
      shop: session.shopDomain,
      replicatedCount: adminCatalog.length,
      message: `Replicated ${adminCatalog.length} products from Shopify into admin backend catalog.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to replicate Shopify store data.' }, { status: 500 });
  }
}
