import { NextRequest, NextResponse } from 'next/server';
import { buildShopifyInstallUrl, generateShopifyState } from '../../../../lib/shopify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const state = generateShopifyState();
  const installUrl = buildShopifyInstallUrl(shop, state);

  const response = NextResponse.redirect(installUrl);
  response.cookies.set('shopify_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
  });

  return response;
}
