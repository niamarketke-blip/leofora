import { NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken, fetchShopifyProducts } from '../../../lib/shopify';

const baseProducts = [
  { id: 1, name: 'Silk Monstera', price: 45.99, image: '🌿', photos: ['🌿', '🍃', '☘️'], sku: 'LED-001', shopifyId: 'prod-001' },
  { id: 2, name: 'Faux Pothos Cascade', price: 32.99, image: '🍃', photos: ['🍃', '🌱', '🪴'], sku: 'PG-002', shopifyId: 'prod-002' },
  { id: 3, name: 'Artificial Snake Grass', price: 28.99, image: '🪴', photos: ['🪴', '🌾', '🌿'], sku: 'SP-003', shopifyId: 'prod-003' },
  { id: 4, name: 'EU Faux Rubber Plant', price: 55.99, image: '🌱', photos: ['🌱', '🍃', '🌳'], sku: 'RP-004', shopifyId: 'prod-004' },
  { id: 5, name: 'Premium Fake Peace Lily', price: 38.99, image: '🌸', photos: ['🌸', '🌿', '🍀'], sku: 'PL-005', shopifyId: 'prod-005' },
  { id: 6, name: 'Deluxe Faux Calathea', price: 49.99, image: '🦜', photos: ['🦜', '🌿', '🎍'], sku: 'CL-006', shopifyId: 'prod-006' },
];

async function getSupplierInfo(sku: string, origin: string) {
  try {
    const response = await fetch(`${origin}/api/suppliers?sku=${sku}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch supplier info:', error);
    return null;
  }
}

async function fetchProductsFromShopify() {
  const session = getShopifySession();
  if (!session.installed || !session.shopDomain) return null;

  const accessToken = getShopifyAccessToken();
  if (!accessToken) return null;

  try {
    const shopProducts = await fetchShopifyProducts(session.shopDomain, accessToken);
    if (!shopProducts) return null;

    return shopProducts.map((edge: any) => {
      const product = edge.node;
      const variant = product.variants?.edges?.[0]?.node;
      const price = parseFloat(variant?.price || product.priceRange?.minVariantPrice?.amount || 0);
      const image = product.images?.edges?.[0]?.node?.url || '🌿';

      return {
        id: product.id,
        name: product.title,
        price,
        image,
        photos: product.images?.edges?.map((img: any) => img.node.url) || [image],
        sku: variant?.sku || 'unknown',
        shopifyId: product.id,
        inStock: (variant?.inventoryQuantity || 0) > 0,
        stock: variant?.inventoryQuantity || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  
  // Try to fetch from Shopify first
  const shopifyProducts = await fetchProductsFromShopify();
  if (shopifyProducts && shopifyProducts.length > 0) {
    return NextResponse.json(shopifyProducts);
  }

  // Fallback to mock products with supplier info
  const productsWithStock = await Promise.all(
    baseProducts.map(async (product) => {
      const supplier = await getSupplierInfo(product.sku, origin);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        photos: product.photos,
        sku: product.sku,
        shopifyId: product.shopifyId,
        inStock: supplier?.stock > 0,
        stock: supplier?.stock ?? 0,
      };
    })
  );

  return NextResponse.json(productsWithStock);
}
