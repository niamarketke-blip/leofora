import { adminProducts, findAdminProductBySku, getNextAdminProductId } from './admin-products-store';

type SourceProduct = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  supplierName: string;
  supplierId: string;
  category: string;
};

type ImportOptions = {
  provider: string;
  limit: number;
  defaultMarkup: number;
  marginRules?: Record<string, number>;
  requiredCountries?: string[];
};

function pickArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function toNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isBotanicalCandidate(item: any) {
  const text = `${item?.name || ''} ${item?.title || ''} ${item?.category || ''} ${item?.description || ''}`.toLowerCase();
  return /plant|faux|artificial|botanical|greenery|flower|decor/.test(text);
}

function normalizeCountries(item: any): string[] {
  const raw = item?.countries || item?.shipToCountries || item?.shippingCountries || item?.markets;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c) => String(c).toUpperCase()).filter(Boolean);
  }
  return String(raw)
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

function supportsCountries(item: any, requiredCountries: string[]) {
  if (!requiredCountries.length) return true;
  const available = normalizeCountries(item);
  if (!available.length) return false;
  return requiredCountries.every((country) => available.includes(country));
}

function resolveMarkup(category: string, defaultMarkup: number, marginRules?: Record<string, number>) {
  if (!marginRules) return defaultMarkup;
  const lower = category.toLowerCase();
  const direct = marginRules[lower];
  if (typeof direct === 'number') return direct;

  for (const [key, val] of Object.entries(marginRules)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  return defaultMarkup;
}

function mapSourceProduct(item: any, provider: string, defaultMarkup: number, marginRules?: Record<string, number>): SourceProduct | null {
  const name = item?.name || item?.title || item?.productName;
  const sku = item?.sku || item?.reference || item?.code || item?.ean || item?.id;
  const category = String(item?.category || item?.productType || item?.type || 'general').trim();
  const basePrice = toNumber(item?.price ?? item?.salePrice ?? item?.wholesalePrice ?? item?.cost, 0);
  const stock = toNumber(item?.stock ?? item?.inventory ?? item?.quantity ?? item?.available, 0);

  if (!name || !sku || basePrice <= 0) return null;
  if (!isBotanicalCandidate(item)) return null;

  const markup = resolveMarkup(category, defaultMarkup, marginRules);

  return {
    name: String(name).trim(),
    sku: String(sku).trim(),
    price: Number((basePrice * markup).toFixed(2)),
    stock,
    supplierName: provider.toUpperCase(),
    supplierId: `eu-${provider}`,
    category,
  };
}

async function fetchProviderProducts(provider: string): Promise<any[]> {
  const upper = provider.toUpperCase();
  const baseUrl = process.env[`${upper}_API_BASE_URL`];
  const apiKey = process.env[`${upper}_API_KEY`];
  const endpoint = process.env[`${upper}_PRODUCTS_ENDPOINT`] || '/products';

  if (!baseUrl || !apiKey) {
    throw new Error(`${upper}_API_BASE_URL and ${upper}_API_KEY must be configured in environment variables.`);
  }

  const url = `${baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Provider API request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  return pickArray(data);
}

export async function importEuProductsFromProvider(options: ImportOptions) {
  const provider = String(options.provider || 'bigbuy').toLowerCase();
  const limit = Math.max(1, Math.min(500, Number(options.limit) || 40));
  const defaultMarkup = Math.max(1, Number(options.defaultMarkup) || 1.55);
  const requiredCountries = (options.requiredCountries || []).map((c) => c.toUpperCase());

  const rawProducts = await fetchProviderProducts(provider);
  const created: any[] = [];
  const skipped: any[] = [];

  for (const raw of rawProducts.slice(0, limit)) {
    if (!supportsCountries(raw, requiredCountries)) {
      skipped.push({ reason: 'missing_required_countries' });
      continue;
    }

    const mapped = mapSourceProduct(raw, provider, defaultMarkup, options.marginRules);
    if (!mapped) {
      skipped.push({ reason: 'not_eligible_or_missing_fields' });
      continue;
    }

    if (findAdminProductBySku(mapped.sku)) {
      skipped.push({ sku: mapped.sku, reason: 'duplicate_sku' });
      continue;
    }

    const newProduct = {
      id: getNextAdminProductId(),
      name: mapped.name,
      price: mapped.price,
      sku: mapped.sku,
      shopifyId: `pending-${mapped.sku}`,
      inStock: mapped.stock > 0,
      stock: mapped.stock,
      supplierId: mapped.supplierId,
      supplierName: mapped.supplierName,
      category: mapped.category,
    };

    adminProducts.push(newProduct as any);
    created.push(newProduct);
  }

  return {
    provider,
    requested: limit,
    requiredCountries,
    importedCount: created.length,
    skippedCount: skipped.length,
    imported: created,
  };
}
