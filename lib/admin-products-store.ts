export type AdminProduct = {
  id: number;
  name: string;
  price: number;
  sku: string;
  shopifyId: string;
  inStock: boolean;
  stock: number;
  supplierId: string;
  supplierName: string;
};

export const adminProducts: AdminProduct[] = [
  { id: 1, name: 'Silk Monstera', price: 45.99, sku: 'LED-001', shopifyId: 'prod-001', inStock: true, stock: 45, supplierId: 'supplier-1', supplierName: 'EU Faux Flora Dropship' },
  { id: 2, name: 'Faux Pothos Cascade', price: 32.99, sku: 'PG-002', shopifyId: 'prod-002', inStock: true, stock: 32, supplierId: 'supplier-1', supplierName: 'EU Faux Flora Dropship' },
  { id: 3, name: 'Artificial Snake Grass', price: 28.99, sku: 'SP-003', shopifyId: 'prod-003', inStock: false, stock: 0, supplierId: 'supplier-1', supplierName: 'EU Faux Flora Dropship' },
  { id: 4, name: 'EU Faux Rubber Plant', price: 55.99, sku: 'RP-004', shopifyId: 'prod-004', inStock: true, stock: 28, supplierId: 'supplier-2', supplierName: 'Euro Fake Plant Logistics' },
  { id: 5, name: 'Premium Fake Peace Lily', price: 38.99, sku: 'PL-005', shopifyId: 'prod-005', inStock: true, stock: 15, supplierId: 'supplier-2', supplierName: 'Euro Fake Plant Logistics' },
  { id: 6, name: 'Deluxe Faux Calathea', price: 49.99, sku: 'CL-006', shopifyId: 'prod-006', inStock: false, stock: 0, supplierId: 'supplier-2', supplierName: 'Euro Fake Plant Logistics' },
];

export function getNextAdminProductId() {
  return adminProducts.length ? Math.max(...adminProducts.map((product) => product.id)) + 1 : 1;
}

export function findAdminProductBySku(sku: string) {
  return adminProducts.find((product) => product.sku.toLowerCase() === sku.toLowerCase());
}

export function replaceAdminProducts(nextProducts: AdminProduct[]) {
  adminProducts.splice(0, adminProducts.length, ...nextProducts);
}
