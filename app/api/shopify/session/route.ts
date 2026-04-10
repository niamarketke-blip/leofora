import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyConfig } from '../../../../lib/shopify';

function toStoreSlug(shopDomain?: string) {
  if (!shopDomain) return '';
  return shopDomain.replace(/\.myshopify\.com$/i, '').trim();
}

export async function GET(request: NextRequest) {
  const session = getShopifySession();
  const config = getShopifyConfig();
  const storeSlug = toStoreSlug(session.shopDomain);

  return NextResponse.json({
    installed: session.installed,
    shop: session.shopDomain,
    storeSlug,
    adminUrl: storeSlug ? `https://admin.shopify.com/store/${storeSlug}` : null,
    tokenPresent: Boolean(session.accessToken || process.env.SHOPIFY_ACCESS_TOKEN),
    apiVersion: config.apiVersion,
    appUrl: config.appUrl,
  });
}
