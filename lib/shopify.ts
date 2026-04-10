import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL || 'http://localhost:3000';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-04';

const APP_SCOPES = [
  'read_products',
  'read_inventory',
  'read_orders',
  'read_themes',
  'write_products',
  'write_inventory',
  'write_orders',
  'write_themes'
].join(',');

const shopifySession: {
  shopDomain?: string;
  accessToken?: string;
  installed?: boolean;
} = {};

export function getShopifyConfig() {
  return {
    apiKey: SHOPIFY_API_KEY,
    apiSecret: SHOPIFY_API_SECRET,
    appUrl: SHOPIFY_APP_URL,
    apiVersion: SHOPIFY_API_VERSION,
    scopes: APP_SCOPES,
  };
}

export function generateShopifyState() {
  return crypto.randomBytes(16).toString('hex');
}

export function buildShopifyInstallUrl(shop: string, state: string) {
  const installUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  installUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
  installUrl.searchParams.set('scope', APP_SCOPES);
  installUrl.searchParams.set('redirect_uri', `${SHOPIFY_APP_URL}/api/shopify/callback`);
  installUrl.searchParams.set('state', state);
  installUrl.searchParams.set('grant_options[]', 'per-user');
  return installUrl.toString();
}

export function verifyShopifyHmac(params: URLSearchParams) {
  const { apiSecret } = getShopifyConfig();
  const hmac = params.get('hmac');
  if (!hmac) return false;

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key === 'hmac' || key === 'signature') return;
    pairs.push(`${key}=${value}`);
  });

  const message = pairs.sort().join('&');
  const digest = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
  return digest === hmac;
}

export function saveShopifySession(shopDomain: string, accessToken: string) {
  shopifySession.shopDomain = shopDomain;
  shopifySession.accessToken = accessToken;
  shopifySession.installed = true;
}

export function getShopifySession() {
  const envShop = process.env.SHOPIFY_STORE_DOMAIN || '';
  const envToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
  const shopDomain = shopifySession.shopDomain || envShop;
  const accessToken = shopifySession.accessToken || envToken;

  return {
    shopDomain,
    accessToken,
    installed: !!shopDomain && !!accessToken,
  };
}

export function getShopifyAccessToken() {
  return shopifySession.accessToken || process.env.SHOPIFY_ACCESS_TOKEN || '';
}

export function getShopifyShopDomain() {
  return shopifySession.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || '';
}

export async function fetchShopifyProducts(shop: string, accessToken: string) {
  if (!accessToken) return null;
  
  const query = `
    {
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  sku
                  inventoryQuantity
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION || '2026-04'}/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Shopify API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.products?.edges || [];
  } catch (error) {
    console.error('Failed to fetch Shopify products:', error);
    return null;
  }
}

export async function createShopifyOrder(shop: string, accessToken: string, orderData: any) {
  if (!accessToken) return null;

  try {
    const response = await fetch(`https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION || '2026-04'}/orders.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: orderData }),
    });

    if (!response.ok) {
      console.error('Shopify order creation error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Failed to create Shopify order:', error);
    return null;
  }
}
