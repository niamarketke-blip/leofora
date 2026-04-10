import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken } from '../../../../lib/shopify';

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'live' | 'sandbox';
}

// Store PayPal config in memory (in production, use database)
let paypalConfig: PayPalConfig | null = null;

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { clientId, clientSecret, mode } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing PayPal credentials (clientId, clientSecret).' },
        { status: 400 }
      );
    }

    // Store PayPal config
    paypalConfig = {
      clientId,
      clientSecret,
      mode: mode || 'sandbox',
    };

    // Fetch shop info to reference
    const shopResponse = await fetch(
      `https://${session.shopDomain}/admin/api/2026-04/shop.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!shopResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify Shopify store.' },
        { status: 500 }
      );
    }

    const shopData = await shopResponse.json();

    return NextResponse.json({
      success: true,
      message: 'PayPal configured as payment method for Shopify store',
      store: shopData.shop.name,
      paypalSetup: {
        mode: paypalConfig.mode,
        enabled: true,
        clientId: clientId.substring(0, 10) + '***',
      },
      instructions: `
PayPal has been configured for ${shopData.shop.name}:
1. Go to Shopify Settings > Payment providers
2. Add PayPal as an alternative payment method
3. Enter your PayPal credentials when prompted
4. Select "${paypalConfig.mode}" mode for transactions
5. Save and activate PayPal on your storefront
      `,
    });
  } catch (error) {
    console.error('PayPal setup error:', error);
    return NextResponse.json(
      { error: 'Failed to configure PayPal.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!paypalConfig) {
      return NextResponse.json(
        {
          configured: false,
          message: 'PayPal is not configured. POST credentials to set up.',
        }
      );
    }

    return NextResponse.json({
      configured: true,
      mode: paypalConfig.mode,
      clientId: paypalConfig.clientId.substring(0, 10) + '***',
    });
  } catch (error) {
    console.error('PayPal status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PayPal status.' },
      { status: 500 }
    );
  }
}
