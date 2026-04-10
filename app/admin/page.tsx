'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type AuthState = {
  username: string;
  role: 'admin' | 'manager';
  token: string;
};

type ProductType = {
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

const initialFormState = {
  name: '',
  price: 0,
  sku: '',
  shopifyId: '',
  inStock: true,
  stock: 0,
  supplierId: '',
  supplierName: '',
};

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [form, setForm] = useState<ProductType>(initialFormState as ProductType);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [provider, setProvider] = useState('bigbuy');
  const [countries, setCountries] = useState('IE,NL');
  const [defaultMarkup, setDefaultMarkup] = useState('1.55');
  const [plantsMarkup, setPlantsMarkup] = useState('1.65');
  const [decorMarkup, setDecorMarkup] = useState('1.50');
  const [stylePreset, setStylePreset] = useState('leofora-signature');
  const [replicating, setReplicating] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('leofora_admin_auth') : null;
    if (stored) {
      setAuth(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (auth) {
      loadProducts();
      loadSuppliers();
    }
  }, [auth]);

  const saveAuth = (authState: AuthState) => {
    setAuth(authState);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leofora_admin_auth', JSON.stringify(authState));
    }
  };

  const clearAuth = () => {
    setAuth(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('leofora_admin_auth');
    }
  };

  const login = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginName.trim(), password: loginPassword }),
      });
      const result = await response.json();
      if (response.ok) {
        saveAuth({ username: result.user.username, role: result.user.role, token: result.token });
        setLoginName('');
        setLoginPassword('');
      } else {
        setMessage(result.error || 'Invalid credentials');
      }
    } catch {
      setMessage('Unable to authenticate. Try again later.');
    }
  };

  const loadProducts = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setProducts(result);
      } else {
        setMessage(result.error || 'Unable to load products.');
      }
    } catch {
      setMessage('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const result = await response.json();
      if (response.ok) {
        setSuppliers(result.suppliers || []);
      }
    } catch {
      // ignore supplier snapshot load failures in admin UI
    }
  };

  const startEdit = (product: ProductType) => {
    setEditingProduct(product);
    setForm(product);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm(initialFormState as ProductType);
    setMessage('');
  };

  const saveProduct = async () => {
    if (!auth) return;
    setMessage('');
    const method = editingProduct ? 'PUT' : 'POST';
    const payload = editingProduct ? { ...form, id: editingProduct.id } : form;

    try {
      const response = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`Product ${editingProduct ? 'updated' : 'created'} successfully.`);
        resetForm();
        loadProducts();
      } else {
        setMessage(result.error || 'Unable to save product.');
      }
    } catch {
      setMessage('Unable to save product.');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!auth) return;
    if (auth.role !== 'admin') {
      setMessage('Only admins can delete products.');
      return;
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage('Product deleted successfully.');
        loadProducts();
      } else {
        setMessage(result.error || 'Unable to delete product.');
      }
    } catch {
      setMessage('Unable to delete product.');
    }
  };

  const syncToShopify = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const response = await fetch('/api/shopify/sync-products', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
      } else {
        setMessage(result.error || 'Failed to sync products to Shopify.');
      }
    } catch (error) {
      setMessage('Unable to sync products to Shopify.');
    } finally {
      setSyncing(false);
    }
  };

  const replicateFromShopify = async () => {
    setReplicating(true);
    setMessage('');
    try {
      const response = await fetch('/api/shopify/replicate-store', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        await loadProducts();
      } else {
        setMessage(result.error || 'Failed to replicate store from Shopify.');
      }
    } catch (error) {
      setMessage('Failed to replicate store from Shopify.');
    } finally {
      setReplicating(false);
    }
  };

  const syncTheme = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const response = await fetch('/api/shopify/theme-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply-store-makeover', preset: stylePreset }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Shopify storefront updated: ${result.theme.name} (${stylePreset} preset).`);
        // Apply theme colors to DOM
        if (result.theme.colors) {
          const root = document.documentElement;
          root.style.setProperty('--color-primary', result.theme.colors.primary);
          root.style.setProperty('--color-secondary', result.theme.colors.secondary);
          root.style.setProperty('--color-accent', result.theme.colors.accent);
          root.style.setProperty('--color-background', result.theme.colors.background);
          root.style.setProperty('--color-text', result.theme.colors.text);
        }
      } else {
        setMessage(result.error || 'Failed to sync theme.');
      }
    } catch (error) {
      setMessage('Unable to sync theme from Shopify.');
    } finally {
      setSyncing(false);
    }
  };

  const importFromEuSource = async () => {
    if (!auth) return;
    setImporting(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/import-eu-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({
          provider,
          limit: 40,
          markupMultiplier: Number(defaultMarkup),
          requiredCountries: countries.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
          marginRules: {
            plants: Number(plantsMarkup),
            decor: Number(decorMarkup),
          },
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Imported ${result.importedCount} products from ${provider.toUpperCase()} into admin backend.`);
        await loadProducts();
      } else {
        setMessage(result.error || 'Unable to import products from EU source.');
      }
    } catch {
      setMessage('Unable to import products from EU source.');
    } finally {
      setImporting(false);
    }
  };

  const runDailyJobNow = async () => {
    setImporting(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/import-eu-products/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-key': 'dev-local-manual-trigger',
        },
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Daily job completed. Imported: ${result.importedCount || 0}, Synced: ${result.syncedCount || 0}.`);
        await loadProducts();
      } else {
        setMessage(result.error || 'Daily job failed.');
      }
    } catch {
      setMessage('Daily job failed.');
    } finally {
      setImporting(false);
    }
  };

  if (!auth) {
    return (
      <main style={{ minHeight: '100vh', background: '#f8fcf7', padding: '40px 20px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '32px' }}>
          <h1 style={{ margin: '0 0 16px 0', color: '#1a3d0a' }}>Leofora Admin Login</h1>
          <p style={{ margin: '0 0 24px 0', color: '#556c58' }}>Enter your credentials to manage products, suppliers, and order fulfillment.</p>
          <label style={{ display: 'block', marginBottom: '12px' }}>
            <span style={{ display: 'block', marginBottom: '6px', color: '#2d7f4f', fontWeight: '700' }}>Username</span>
            <input value={loginName} onChange={(e) => setLoginName(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
          </label>
          <label style={{ display: 'block', marginBottom: '18px' }}>
            <span style={{ display: 'block', marginBottom: '6px', color: '#2d7f4f', fontWeight: '700' }}>Password</span>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
          </label>
          <button onClick={login} style={{ width: '100%', padding: '14px 16px', background: '#2d7f4f', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Sign in</button>
          {message && <p style={{ marginTop: '18px', color: '#d1495b' }}>{message}</p>}
          <p style={{ marginTop: '24px', color: '#556c58', fontSize: '0.95rem' }}>Demo credentials: admin/admin123 or manager/manager123.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fcf7', padding: '32px 18px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <p style={{ margin: 0, color: '#2d7f4f', letterSpacing: '0.12em', fontWeight: '700' }}>LEOFORA ADMIN</p>
            <h1 style={{ margin: '12px 0 0 0', fontSize: '2.7rem', color: '#1a3d0a' }}>Control center for product and supplier management.</h1>
            <p style={{ margin: '12px 0 0 0', color: '#556c58', maxWidth: '680px' }}>Use your admin access to update the product catalog, manage supplier assignments, and control the orders that flow through Leofora.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '12px 16px', borderRadius: '999px', background: '#e7f7eb', color: '#2d7f4f', fontWeight: '700' }}>{auth.role.toUpperCase()}</span>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a' }}>
              <option value='bigbuy'>BIGBUY (EU)</option>
              <option value='avasam'>AVASAM (EU)</option>
            </select>
            <input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder='IE,NL' style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', width: '100px' }} />
            <input value={defaultMarkup} onChange={(e) => setDefaultMarkup(e.target.value)} placeholder='1.55' style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', width: '80px' }} />
            <input value={plantsMarkup} onChange={(e) => setPlantsMarkup(e.target.value)} placeholder='plants' style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', width: '90px' }} />
            <input value={decorMarkup} onChange={(e) => setDecorMarkup(e.target.value)} placeholder='decor' style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', width: '90px' }} />
            <select value={stylePreset} onChange={(e) => setStylePreset(e.target.value)} style={{ padding: '11px 14px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a' }}>
              <option value='leofora-signature'>LEOFORA SIGNATURE</option>
              <option value='botanical'>BOTANICAL STYLE</option>
              <option value='modern'>MODERN STYLE</option>
              <option value='luxury'>LUXURY STYLE</option>
            </select>
            <button onClick={importFromEuSource} disabled={importing} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: importing ? '#ddd' : 'white', color: '#1a3d0a', cursor: importing ? 'not-allowed' : 'pointer' }}>{importing ? 'Importing...' : '⬇ Import EU Products'}</button>
            <button onClick={runDailyJobNow} disabled={importing} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: importing ? '#ddd' : 'white', color: '#1a3d0a', cursor: importing ? 'not-allowed' : 'pointer' }}>{importing ? 'Running...' : '⏱ Run Daily Job'}</button>
            <button onClick={replicateFromShopify} disabled={replicating} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: replicating ? '#ddd' : 'white', color: '#1a3d0a', cursor: replicating ? 'not-allowed' : 'pointer' }}>{replicating ? 'Replicating...' : '🧬 Replicate Store'}</button>
            <button onClick={syncToShopify} disabled={syncing} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: syncing ? '#ddd' : 'white', color: '#1a3d0a', cursor: syncing ? 'not-allowed' : 'pointer' }}>{syncing ? 'Syncing...' : '📤 Sync to Shopify'}</button>
            <button onClick={syncTheme} disabled={syncing} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: syncing ? '#ddd' : 'white', color: '#1a3d0a', cursor: syncing ? 'not-allowed' : 'pointer' }}>{syncing ? 'Updating...' : '🎨 Update Shopify Theme'}</button>
            <Link href="/store-config" style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', textDecoration: 'none' }}>⚙️ Store Config</Link>
            <button onClick={clearAuth} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', cursor: 'pointer' }}>Log out</button>
            <Link href="/shopify" style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dfe7dd', background: 'white', color: '#1a3d0a', textDecoration: 'none' }}>Shopify Connect</Link>
            <Link href="/" style={{ padding: '12px 18px', borderRadius: '999px', background: '#2d7f4f', color: 'white', textDecoration: 'none' }}>View Store</Link>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '26px', marginBottom: '30px' }}>
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', color: '#1a3d0a' }}>Product Catalog</h2>
                <p style={{ margin: 0, color: '#556c58' }}>Manage active products, pricing, stock, and supplier assignments.</p>
              </div>
              <button onClick={resetForm} style={{ padding: '12px 16px', borderRadius: '999px', border: 'none', background: '#2d7f4f', color: 'white', cursor: 'pointer' }}>New Product</button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#556c58', borderBottom: '2px solid #e8f1ea' }}>
                    <th style={{ padding: '14px 12px' }}>Name</th>
                    <th style={{ padding: '14px 12px' }}>SKU</th>
                    <th style={{ padding: '14px 12px' }}>Price</th>
                    <th style={{ padding: '14px 12px' }}>Stock</th>
                    <th style={{ padding: '14px 12px' }}>Supplier</th>
                    <th style={{ padding: '14px 12px' }}>Status</th>
                    <th style={{ padding: '14px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f6f0' }}>
                      <td style={{ padding: '14px 12px', color: '#1a3d0a', fontWeight: '700' }}>{product.name}</td>
                      <td style={{ padding: '14px 12px', color: '#556c58' }}>{product.sku}</td>
                      <td style={{ padding: '14px 12px', color: '#2d7f4f' }}>${product.price.toFixed(2)}</td>
                      <td style={{ padding: '14px 12px', color: '#556c58' }}>{product.stock}</td>
                      <td style={{ padding: '14px 12px', color: '#556c58' }}>{product.supplierName || 'Unassigned'}</td>
                      <td style={{ padding: '14px 12px', color: product.inStock ? '#2d7f4f' : '#d1495b', fontWeight: '700' }}>{product.inStock ? 'Active' : 'Out'}</td>
                      <td style={{ padding: '14px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(product)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#2d7f4f', color: 'white', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteProduct(product.id)} disabled={auth.role !== 'admin'} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #e8f1ea', background: auth.role === 'admin' ? '#ffffff' : '#f5f5f5', color: auth.role === 'admin' ? '#c12d19' : '#999', cursor: auth.role === 'admin' ? 'pointer' : 'not-allowed' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '28px' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1a3d0a' }}>{editingProduct ? 'Edit product' : 'New product'}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder='Product name' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder='SKU' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
              <input value={form.shopifyId} onChange={(e) => setForm({ ...form, shopifyId: e.target.value })} placeholder='Shopify ID' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input type='number' value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder='Price' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
                <input type='number' value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder='Stock' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
              </div>
              <input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value, supplierId: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder='Supplier name' style={{ padding: '14px', borderRadius: '14px', border: '1px solid #dfe7dd' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#556c58' }}>
                <input type='checkbox' checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
                Mark as in stock
              </label>
              <button onClick={saveProduct} style={{ padding: '14px', borderRadius: '14px', border: 'none', background: '#2d7f4f', color: 'white', fontWeight: '700', cursor: 'pointer' }}>{editingProduct ? 'Update product' : 'Add product'}</button>
              {message && <p style={{ color: '#2d7f4f' }}>{message}</p>}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '28px' }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#1a3d0a' }}>Supplier network</h2>
            <p style={{ margin: '0 0 18px 0', color: '#556c58' }}>Review supplier inventory and assignment for dropship orders.</p>
            <div style={{ display: 'grid', gap: '14px' }}>
              {suppliers.map((supplier) => (
                <div key={supplier.id} style={{ padding: '18px', borderRadius: '18px', background: '#f8fcf7', border: '1px solid #e8f1ea' }}>
                  <strong style={{ display: 'block', color: '#2d7f4f', marginBottom: '6px' }}>{supplier.name}</strong>
                  <span style={{ color: '#556c58', fontSize: '0.95rem' }}>Supplier ID: {supplier.id}</span>
                  <div style={{ marginTop: '10px', color: '#2d7f4f', fontWeight: '700' }}>Products: {supplier.products.length}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '28px' }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#1a3d0a' }}>Role controls</h2>
            <p style={{ margin: '0 0 18px 0', color: '#556c58' }}>Only admin accounts can delete products. Managers can add and edit listings.</p>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ padding: '18px', borderRadius: '18px', background: '#f8fcf7', border: '1px solid #e8f1ea' }}>
                <strong style={{ display: 'block', color: '#2d7f4f' }}>User</strong>
                <span style={{ color: '#556c58' }}>{auth.username}</span>
              </div>
              <div style={{ padding: '18px', borderRadius: '18px', background: '#f8fcf7', border: '1px solid #e8f1ea' }}>
                <strong style={{ display: 'block', color: '#2d7f4f' }}>Role</strong>
                <span style={{ color: '#556c58' }}>{auth.role}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
