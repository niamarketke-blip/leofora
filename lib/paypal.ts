import { createHash } from 'crypto';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

const baseURL = PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

  return accessToken as string;
}

export async function createOrder(items: any[], customerEmail: string) {
  const token = await getAccessToken();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: total.toFixed(2),
      },
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity.toString(),
        unit_amount: {
          currency_code: 'USD',
          value: item.price.toFixed(2),
        },
      })),
    }],
    application_context: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/confirm`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    },
  };

  const response = await fetch(`${baseURL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to create PayPal order');
  }

  const order = await response.json();
  return order;
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();

  const response = await fetch(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to capture PayPal order');
  }

  const capture = await response.json();
  return capture;
}

export async function refundCapture(captureId: string, amount: number) {
  const token = await getAccessToken();

  const refundData = {
    amount: {
      value: amount.toFixed(2),
      currency_code: 'USD',
    },
  };

  const response = await fetch(`${baseURL}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(refundData),
  });

  if (!response.ok) {
    throw new Error('Failed to process refund');
  }

  const refund = await response.json();
  return refund;
}

export function verifyWebhookSignature(rawBody: string, signature: string, webhookId: string): boolean {
  const expectedSignature = createHash('sha256')
    .update(webhookId + rawBody)
    .digest('hex');

  return signature === expectedSignature;
}