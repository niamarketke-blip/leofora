import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAccessToken, getShopifyShopDomain, getShopifyConfig } from '../../../lib/shopify';

// Mock supplier data as fallback - in real implementation, this would connect to actual supplier APIs
const suppliers = [
  {
    id: 'supplier-1',
    name: 'EU Faux Flora Dropship',
    paypalEmail: 'eudropship@paypal.com',
    products: [
      { sku: 'LED-001', stock: 45, lastUpdated: '2026-04-09T10:00:00Z' },
      { sku: 'PG-002', stock: 32, lastUpdated: '2026-04-09T09:30:00Z' },
      { sku: 'SP-003', stock: 0, lastUpdated: '2026-04-09T08:15:00Z' },
    ]
  },
  {
    id: 'supplier-2',
    name: 'Euro Fake Plant Logistics',
    paypalEmail: 'payments@eufakeplants.eu',
    products: [
      { sku: 'RP-004', stock: 28, lastUpdated: '2026-04-09T11:00:00Z' },
      { sku: 'PL-005', stock: 15, lastUpdated: '2026-04-09T10:45:00Z' },
      { sku: 'CL-006', stock: 0, lastUpdated: '2026-04-09T09:00:00Z' },
    ]
  }
];

// SKU to Shopify Product ID mapping (improvise based on current data)
const skuToProductId: Record<string, string> = {
  'LED-001': '1', // Assuming product ID 1 for Monstera
  'PG-002': '2',  // Pothos Golden
  'SP-003': '3',  // Snake Plant
  'RP-004': '4',  // Rubber Plant
  'PL-005': '5',  // Peace Lily
  'CL-006': '6',  // Chinese Evergreen
};

// Function to fetch live stock from Shopify
async function fetchShopifyStock(productId: string) {
  try {
    const shopDomain = getShopifyShopDomain();
    const accessToken = getShopifyAccessToken();

    // Skip Shopify fetch if not connected
    if (!shopDomain || !accessToken) {
      return null;
    }

    const query = `
      query getProductInventory($id: ID!) {
        product(id: $id) {
          variants(first: 10) {
            edges {
              node {
                id
                sku
                inventoryQuantity
                inventoryItem {
                  tracked
                }
              }
            }
          }
        }
      }
    `;

    const { apiVersion } = getShopifyConfig();
    const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { id: `gid://shopify/Product/${productId}` },
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const product = data.data?.product;

    if (!product) {
      return null;
    }

    // Return stock for the first variant (assuming single variant or primary)
    const variant = product.variants.edges[0]?.node;
    return variant ? {
      stock: variant.inventoryQuantity || 0,
      lastUpdated: new Date().toISOString(),
      tracked: variant.inventoryItem?.tracked || false,
    } : null;
  } catch (error) {
    console.error('Failed to fetch Shopify stock:', error);
    return null;
  }
}

// Simulate real-time stock updates (fallback)
function updateStockLevels() {
  suppliers.forEach(supplier => {
    supplier.products.forEach(product => {
      const randomChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
      product.stock = Math.max(0, product.stock + randomChange);
      product.lastUpdated = new Date().toISOString();
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    updateStockLevels();

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const sku = searchParams.get('sku');

    if (supplierId) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      return NextResponse.json(supplier);
    }

    if (sku) {
      // Try to fetch live stock from Shopify first
      const productId = skuToProductId[sku];
      if (productId) {
        const liveStock = await fetchShopifyStock(productId);
        if (liveStock) {
          return NextResponse.json({
            ...liveStock,
            sku,
            supplierId: 'shopify-supplier',
            supplierName: 'Shopify Store Supplier'
          });
        }
      }

      // Fallback to mock data
      for (const supplier of suppliers) {
        const product = supplier.products.find(p => p.sku === sku);
        if (product) {
          return NextResponse.json({
            ...product,
            supplierId: supplier.id,
            supplierName: supplier.name
          });
        }
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      suppliers,
      lastSync: new Date().toISOString(),
      message: 'Dropshipping supplier integration active - stock levels updated in real-time'
    });
  } catch (error) {
    console.error('Supplier API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function findSupplier(supplierId: string) {
  return suppliers.find(supplier => supplier.id === supplierId) || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sku, quantity, supplierId, items } = body;

    if (action === 'order' && supplierId && Array.isArray(items)) {
      const supplier = findSupplier(supplierId);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const orderItems = items.map((item: any) => {
        const product = supplier.products.find(p => p.sku === item.sku);
        return {
          sku: item.sku,
          quantity: item.quantity,
          available: !!product,
          remainingStock: product?.stock ?? 0
        };
      });

      const insufficient = orderItems.filter(item => item.available && item.remainingStock < item.quantity);
      const missing = orderItems.filter(item => !item.available);

      if (insufficient.length || missing.length) {
        return NextResponse.json({
          error: 'Supplier batch order could not be fulfilled',
          insufficient,
          missing,
          supplier: supplier.name
        }, { status: 400 });
      }

      orderItems.forEach(item => {
        const product = supplier.products.find(p => p.sku === item.sku);
        if (product) {
          product.stock -= item.quantity;
          product.lastUpdated = new Date().toISOString();
        }
      });

      return NextResponse.json({
        success: true,
        orderId: `ORD-${Date.now()}`,
        supplier: supplier.name,
        supplierId: supplier.id,
        items: orderItems,
        estimatedDelivery: '2-3 business days'
      });
    }

    if (action === 'order' && sku && quantity) {
      for (const supplier of suppliers) {
        const product = supplier.products.find(p => p.sku === sku);
        if (product && product.stock >= quantity) {
          product.stock -= quantity;
          product.lastUpdated = new Date().toISOString();

          return NextResponse.json({
            success: true,
            orderId: `ORD-${Date.now()}`,
            supplier: supplier.name,
            sku,
            quantity,
            remainingStock: product.stock,
            estimatedDelivery: '2-3 business days'
          });
        }
      }
      return NextResponse.json({
        error: 'Insufficient stock or product not found',
        availableSuppliers: suppliers.map(s => ({
          name: s.name,
          products: s.products.filter(p => p.sku === sku).map(p => ({ sku: p.sku, stock: p.stock }))
        }))
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Supplier API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}