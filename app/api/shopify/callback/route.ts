import { NextRequest, NextResponse } from 'next/server';
import { getShopifyConfig, verifyShopifyHmac, saveShopifySession } from '../../../../lib/shopify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const storedState = request.cookies.get('shopify_oauth_state')?.value;
  if (!shop || !code || !state || !storedState || storedState !== state) {
    return NextResponse.json({ error: 'Invalid OAuth callback or missing parameters.' }, { status: 400 });
  }

  if (!verifyShopifyHmac(searchParams)) {
    return NextResponse.json({ error: 'HMAC verification failed.' }, { status: 400 });
  }

  const { apiKey, apiSecret, appUrl } = getShopifyConfig();

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    return NextResponse.json({ error: 'Unable to fetch Shopify access token.', details: errorBody }, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  saveShopifySession(shop, tokenData.access_token);

  const redirectUrl = new URL(`${appUrl}/admin`);
  redirectUrl.searchParams.set('shopifyInstalled', 'true');

  const response = NextResponse.redirect(redirectUrl.toString());
  response.cookies.delete('shopify_oauth_state');
  return response;
}
